import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

const PRODUCTS = [
  {id: 1, name: 'Hari Mirch', emoji: '🌶️'},
  {id: 2, name: 'Aloo', emoji: '🥔'},
  {id: 3, name: 'Tamatar', emoji: '🍅'},
  {id: 4, name: 'Palak', emoji: '🥬'},
  {id: 5, name: 'Pyaaz', emoji: '🧅'},
  {id: 6, name: 'Bhindi', emoji: '🫑'},
  {id: 7, name: 'Gajar', emoji: '🥕'},
  {id: 8, name: 'Baingan', emoji: '🍆'},
  {id: 9, name: 'Gobhi', emoji: '🥦'},
  {id: 10, name: 'Lauki', emoji: '🫙'},
];

const DELIVERY_CHARGE = 15;

export default function CartScreen({navigation, route}) {
  const [cart, setCart] = useState(route.params?.cart || {});

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
      const product = PRODUCTS.find(p => p.id === parseInt(pid));
      return {product, variant, qty, key};
    })
    .filter(i => i.product);

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Pehle kuch items add karo!');
      return;
    }
    Alert.alert(
      'Order Confirm करें?',
      `${cartItems.length} items + ₹${DELIVERY_CHARGE} delivery\n\nDelivery: Kal 8:00 AM\nCutoff: Aaj 5:00 AM`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Place Order ✅',
          onPress: () => {
            navigation.navigate('Orders');
          },
        },
      ],
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.cartItem}>
      <View style={styles.itemEmoji}>
        <Text style={styles.emojiText}>{item.product.emoji}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
        <Text style={styles.itemPrice}>
          Price: <Text style={styles.pending}>Pending ⏳</Text>
        </Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() =>
            updateCart(item.product.id, item.variant, item.qty - 1)
          }>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.qty}</Text>
        <TouchableOpacity
          style={[styles.qtyBtn, styles.qtyBtnGreen]}
          onPress={() =>
            updateCart(item.product.id, item.variant, item.qty + 1)
          }>
          <Text style={[styles.qtyBtnText, {color: Colors.white}]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.emptySub}>Kuch vegetables add karo</Text>
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
              🚚 Delivery tomorrow at 8:00 AM • Block A
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
              <Text style={styles.summaryPending}>Pending ⏳</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryGreen}>₹{DELIVERY_CHARGE}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                Pending + ₹{DELIVERY_CHARGE}
              </Text>
            </View>
            <View style={styles.notifBox}>
              <Text style={styles.notifText}>
                🔔 Admin price set karne ke baad notification aayega
              </Text>
            </View>
          </View>

          {/* Place Order Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={handlePlaceOrder}>
              <Text style={styles.orderBtnText}>Place Order ✅</Text>
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
  pending: {color: Colors.accent, fontWeight: '700'},
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
  summaryPending: {fontSize: 13, color: Colors.accent, fontWeight: '600'},
  summaryGreen: {fontSize: 13, color: Colors.primary, fontWeight: '700'},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: 10},
  totalLabel: {fontSize: 15, fontWeight: '800', color: Colors.text},
  totalValue: {fontSize: 14, fontWeight: '800', color: Colors.accent},
  notifBox: {
    marginTop: 10,
    backgroundColor: Colors.primaryPale,
    borderRadius: 8,
    padding: 10,
  },
  notifText: {fontSize: 11, color: Colors.primary, textAlign: 'center'},
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
