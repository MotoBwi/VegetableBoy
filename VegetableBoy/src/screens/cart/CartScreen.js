import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import {Colors} from '../../theme/colors';
import {userPaymentApi, userAuthApi, productApi} from '../../services/api';
import {RAZORPAY_KEY_ID} from '../../services/config';

export default function CartScreen({navigation, route}) {
  const [cart, setCart] = useState(route.params?.cart || {});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    userAuthApi
      .getUser()
      .then(setUser)
      .catch(() => {});
    productApi
      .getProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const updateCart = (productId, variant, newQty) => {
    const key = `${productId}_${variant}`;
    const updated = {...cart};
    if (newQty <= 0) {
      delete updated[key];
    } else {
      updated[key] = newQty;
    }
    setCart(updated);
    if (route.params?.setCart) {
      route.params.setCart(updated);
    }
  };

  const cartItems = Object.entries(cart)
    .map(([key, qty]) => {
      const [pid, variant] = key.split('_');
      return {productId: pid, variant, qty, key};
    })
    .filter(i => i.qty > 0);

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return sum;
    const price =
      item.variant === '250g'
        ? prod.price250
        : item.variant === '500g'
        ? prod.price500
        : prod.price1kg;
    return sum + (price || 0) * item.qty;
  }, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add some items first!');
      return;
    }

    const items = cartItems.map(item => ({
      productId: item.productId,
      variant: item.variant,
      qty: item.qty,
    }));

    setLoading(true);
    try {
      const paymentData = await userPaymentApi.createOrder(items);

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Vegetable Boy',
        description: 'UPI Order Payment',
        order_id: paymentData.razorpayOrderId,
        prefill: {
          contact: user?.phone || '',
          name: user?.name || '',
        },
        theme: {color: Colors.primary},
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },
      };

      RazorpayCheckout.open(options)
        .then(async data => {
          try {
            await userPaymentApi.verifyPayment({
              razorpayOrderId: paymentData.razorpayOrderId,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpaySignature: data.razorpay_signature,
            });
            setCart({});
            if (route.params?.setCart) {
              route.params.setCart({});
            }
            Alert.alert('Payment Successful', 'Your order has been placed!', [
              {
                text: 'View Orders',
                onPress: () => navigation.navigate('Orders'),
              },
            ]);
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not verify payment.');
          }
        })
        .catch(async error => {
          console.log('Razorpay error:', error);
          const reason =
            error?.description ||
            error?.error?.description ||
            error?.code ||
            'Payment cancelled or failed';
          try {
            await userPaymentApi.recordFailure({
              razorpayOrderId: paymentData.razorpayOrderId,
              reason,
            });
          } catch {}
          Alert.alert(
            'Payment Failed',
            `${reason}\n\nYour order was not placed. Please try again.`,
            [{text: 'OK'}],
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not initiate payment.');
      setLoading(false);
    }
  };

  const renderItem = ({item}) => {
    const prod = products.find(p => p.id === item.productId);
    const price = prod
      ? item.variant === '250g'
        ? prod.price250
        : item.variant === '500g'
        ? prod.price500
        : prod.price1kg
      : 0;
    const emoji = prod?.emoji || '🥗';
    const name = prod?.name || item.productId;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemEmoji}>
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemVariant}>{item.variant}</Text>
          <Text style={styles.itemPrice}>
            ₹{price || 0} × {item.qty} ={' '}
            <Text style={styles.itemTotal}>₹{(price || 0) * item.qty}</Text>
          </Text>
        </View>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() =>
              updateCart(item.productId, item.variant, item.qty - 1)
            }>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.qty}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, styles.qtyBtnGreen]}
            onPress={() =>
              updateCart(item.productId, item.variant, item.qty + 1)
            }>
            <Text style={[styles.qtyBtnText, {color: Colors.white}]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerCount}>({cartCount} items)</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Cart is Empty!</Text>
          <Text style={styles.emptySub}>Add some fresh vegetables</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.shopBtnText}>Browse Vegetables</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Delivery Info */}
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryInfoText}>
              🚚 Delivery tomorrow at 8:00 AM • {user?.block || 'Your Block'}
            </Text>
            <Text style={styles.cutoffText}>⏰ Order before 5:00 AM</Text>
          </View>

          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Price Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Price Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({cartCount} items)
              </Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryGreen}>₹15</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{subtotal + 15}</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.orderBtn, loading && {opacity: 0.7}]}
              onPress={handlePlaceOrder}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.orderBtnText}>
                  Pay with UPI — ₹{subtotal + 15} 💳
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {fontSize: 20, color: Colors.white, fontWeight: '700'},
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
  },
  headerCount: {fontSize: 13, color: 'rgba(255,255,255,0.7)', marginLeft: 4},
  emptyCart: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  emptyEmoji: {fontSize: 72},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: Colors.text},
  emptySub: {fontSize: 13, color: Colors.textMuted},
  shopBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  shopBtnText: {color: Colors.white, fontWeight: '700', fontSize: 14},
  deliveryInfo: {
    backgroundColor: Colors.primaryPale,
    margin: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  deliveryInfoText: {fontSize: 12, fontWeight: '700', color: Colors.primary},
  cutoffText: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  list: {paddingHorizontal: 12, paddingBottom: 8},
  cartItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemEmoji: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primaryPale,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {fontSize: 30},
  itemInfo: {flex: 1},
  itemName: {fontSize: 14, fontWeight: '700', color: Colors.text},
  itemVariant: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  itemPrice: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  itemTotal: {color: Colors.primary, fontWeight: '700'},
  qtyControl: {flexDirection: 'row', alignItems: 'center', gap: 8},
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  qtyBtnGreen: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  qtyBtnText: {fontSize: 18, fontWeight: '700', color: Colors.text},
  qtyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {fontSize: 13, color: Colors.textMid},
  summaryValue: {fontSize: 13, color: Colors.text, fontWeight: '700'},
  summaryGreen: {fontSize: 13, color: Colors.primary, fontWeight: '700'},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: 10},
  totalLabel: {fontSize: 15, fontWeight: '800', color: Colors.text},
  totalValue: {fontSize: 15, fontWeight: '800', color: Colors.primary},
  footer: {
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },
  orderBtnText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
});
