import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

const VARIANTS = ['250g', '500g', '1kg'];

export default function ProductDetailScreen({navigation, route}) {
  const {product} = route.params;
  const [selectedVariant, setSelectedVariant] = useState('500g');
  const [cart, setCart] = useState(route.params.cart || {});
  const [showNotif, setShowNotif] = useState(false);

  const cartKey = `${product.id}_${selectedVariant}`;
  const qty = cart[cartKey] || 0;

  const updateCart = newQty => {
    const updated = {...cart};
    if (newQty <= 0) {
      delete updated[cartKey];
    } else {
      updated[cartKey] = newQty;
    }
    setCart(updated);
    if (route.params.setCart) {
      route.params.setCart(updated);
    }
  };

  const handleAddToCart = () => {
    updateCart(qty + 1);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2000);
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Toast Notification */}
      {showNotif && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            {product.name} ({selectedVariant}) added! 🛒
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() =>
            navigation.navigate('Cart', {cart, setCart: route.params.setCart})
          }>
          <Text style={styles.cartEmoji}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{product.emoji}</Text>
          <Text style={styles.heroName}>{product.name}</Text>
          <Text style={styles.heroCategory}>{product.category} Vegetable</Text>
          {product.badge && (
            <View
              style={[styles.heroBadge, {backgroundColor: product.badgeColor}]}>
              <Text style={styles.heroBadgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        {/* Price Info */}
        <View style={styles.priceBox}>
          <Text style={styles.priceBoxTitle}>💡 Price Info</Text>
          <Text style={styles.priceBoxDesc}>
            Final price set by admin at delivery time.
          </Text>
          <Text style={styles.priceBoxSub}>
            You'll get a notification when price is updated! 🔔
          </Text>
        </View>

        {/* Variant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Weight</Text>
          <View style={styles.variantRow}>
            {VARIANTS.map(v => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.variantBtn,
                  selectedVariant === v && styles.variantBtnActive,
                ]}
                onPress={() => setSelectedVariant(v)}>
                <Text
                  style={[
                    styles.variantText,
                    selectedVariant === v && styles.variantTextActive,
                  ]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateCart(qty - 1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, styles.qtyBtnGreen]}
              onPress={() => updateCart(qty + 1)}>
              <Text style={[styles.qtyBtnText, {color: Colors.white}]}>+</Text>
            </TouchableOpacity>
            {qty === 0 && <Text style={styles.qtyHint}>Tap + to add</Text>}
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryBox}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>🚚</Text>
            <View>
              <Text style={styles.deliveryTitle}>Delivery at 8:00 AM</Text>
              <Text style={styles.deliverySub}>
                Order before 5:00 AM cutoff
              </Text>
            </View>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>💵</Text>
            <View>
              <Text style={styles.deliveryTitle}>₹15 Delivery Charge</Text>
              <Text style={styles.deliverySub}>Flat charge per order</Text>
            </View>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>💳</Text>
            <View>
              <Text style={styles.deliveryTitle}>Cash or UPI at doorstep</Text>
              <Text style={styles.deliverySub}>No online payment in app</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>
            {qty > 0 ? `Added (${qty}) — Add More +` : '+ Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    zIndex: 100,
    alignItems: 'center',
    elevation: 10,
  },
  toastText: {color: Colors.white, fontSize: 13, fontWeight: '600'},
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
  },
  cartBtn: {position: 'relative'},
  cartEmoji: {fontSize: 24},
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {color: Colors.white, fontSize: 10, fontWeight: '700'},
  hero: {
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroEmoji: {fontSize: 100},
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  heroCategory: {fontSize: 13, color: Colors.textMuted, marginTop: 4},
  heroBadge: {
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  heroBadgeText: {fontSize: 12, color: Colors.white, fontWeight: '700'},
  priceBox: {
    margin: 16,
    backgroundColor: Colors.accentPale,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  priceBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  priceBoxDesc: {fontSize: 13, color: Colors.textMid},
  priceBoxSub: {fontSize: 11, color: Colors.textMuted, marginTop: 4},
  section: {marginHorizontal: 16, marginBottom: 16},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  variantRow: {flexDirection: 'row', gap: 10},
  variantBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  variantBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  variantText: {fontSize: 15, fontWeight: '700', color: Colors.textMid},
  variantTextActive: {color: Colors.white},
  qtyRow: {flexDirection: 'row', alignItems: 'center', gap: 16},
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  qtyBtnGreen: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  qtyBtnText: {fontSize: 22, fontWeight: '700', color: Colors.text},
  qtyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  qtyHint: {fontSize: 12, color: Colors.textMuted},
  deliveryBox: {
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  deliveryIcon: {fontSize: 22},
  deliveryTitle: {fontSize: 13, fontWeight: '700', color: Colors.text},
  deliverySub: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },
  addBtnText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
});
