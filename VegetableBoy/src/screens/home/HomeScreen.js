import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

const PRODUCTS = [
  {
    id: 1,
    name: 'Hari Mirch',
    emoji: '🌶️',
    category: 'Spicy',
    badge: 'Hot',
    badgeColor: Colors.red,
  },
  {
    id: 2,
    name: 'Aloo',
    emoji: '🥔',
    category: 'Staple',
    badge: 'Best Seller',
    badgeColor: Colors.primary,
  },
  {id: 3, name: 'Tamatar', emoji: '🍅', category: 'Staple', badge: null},
  {
    id: 4,
    name: 'Palak',
    emoji: '🥬',
    category: 'Leafy',
    badge: 'Fresh',
    badgeColor: Colors.primaryLight,
  },
  {id: 5, name: 'Pyaaz', emoji: '🧅', category: 'Staple', badge: null},
  {
    id: 6,
    name: 'Bhindi',
    emoji: '🫑',
    category: 'Seasonal',
    badge: 'Seasonal',
    badgeColor: Colors.accent,
  },
  {id: 7, name: 'Gajar', emoji: '🥕', category: 'Root', badge: null},
  {id: 8, name: 'Baingan', emoji: '🍆', category: 'Seasonal', badge: null},
  {
    id: 9,
    name: 'Gobhi',
    emoji: '🥦',
    category: 'Seasonal',
    badge: 'Fresh',
    badgeColor: Colors.primaryLight,
  },
  {id: 10, name: 'Lauki', emoji: '🫙', category: 'Seasonal', badge: null},
];

const CATEGORIES = ['All', 'Staple', 'Leafy', 'Spicy', 'Seasonal', 'Root'];

export default function HomeScreen({navigation}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const renderProduct = ({item, index}) => {
    const inCart = Object.keys(cart).some(k => k.startsWith(`${item.id}_`));
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isLeft ? {marginRight: 6} : {marginLeft: 6},
        ]}
        onPress={() =>
          navigation.navigate('ProductDetail', {product: item, cart, setCart})
        }>
        <View style={styles.productImageArea}>
          <Text style={styles.productEmoji}>{item.emoji}</Text>
          {item.badge && (
            <View style={[styles.badge, {backgroundColor: item.badgeColor}]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {inCart && (
            <View style={styles.inCartBadge}>
              <Text style={styles.inCartText}>✓ Added</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>Price set at delivery 🔔</Text>
          <View style={styles.variantRow}>
            {['250g', '500g', '1kg'].map(v => (
              <View key={v} style={styles.variantChip}>
                <Text style={styles.variantText}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoArea}>
            <Text style={styles.logoEmoji}>🥦</Text>
            <View>
              <Text style={styles.appName}>Vegetable Boy</Text>
              <Text style={styles.tagline}>
                Fresh Vegetables, Daily Delivery
              </Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Cart', {cart, setCart})}>
              <Text style={styles.iconEmoji}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.iconEmoji}>📦</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Strip */}
        <View style={styles.deliveryStrip}>
          <Text style={styles.deliveryStripText}>📍 Block A — Sector 4</Text>
          <View style={styles.cutoffBadge}>
            <Text style={styles.cutoffText}>⏰ Order by 5:00 AM</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search vegetables..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>🌅 Morning Fresh</Text>
          <Text style={styles.bannerSub}>
            Order before 5 AM → Delivered by 8 AM
          </Text>
          <View style={styles.bannerChip}>
            <Text style={styles.bannerChipText}>+ ₹15 delivery only</Text>
          </View>
        </View>
        <Text style={styles.bannerEmoji}>🥬</Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                activeCategory === cat && styles.catChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}>
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.catTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filtered}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {filtered.length} vegetables available
          </Text>
        }
      />

      {/* Cart Bottom Bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('Cart', {cart, setCart})}>
          <View style={styles.cartBarLeft}>
            <Text style={styles.cartBarCount}>{cartCount} items</Text>
          </View>
          <Text style={styles.cartBarText}>View Cart 🛒</Text>
          <Text style={styles.cartBarRight}>+ ₹15 →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoArea: {flexDirection: 'row', alignItems: 'center', gap: 8},
  logoEmoji: {fontSize: 28},
  appName: {fontSize: 18, fontWeight: '800', color: Colors.white},
  tagline: {fontSize: 10, color: 'rgba(255,255,255,0.7)'},
  headerIcons: {flexDirection: 'row', gap: 12},
  iconBtn: {position: 'relative'},
  iconEmoji: {fontSize: 24},
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
  deliveryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  deliveryStripText: {fontSize: 12, color: Colors.white, fontWeight: '600'},
  cutoffBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    padding: 4,
  },
  cutoffText: {fontSize: 10, color: Colors.white},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  searchIcon: {fontSize: 16},
  searchInput: {flex: 1, fontSize: 14, color: Colors.text},
  banner: {
    margin: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {fontSize: 15, fontWeight: '800', color: Colors.white},
  bannerSub: {fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2},
  bannerChip: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  bannerChipText: {fontSize: 11, color: Colors.white, fontWeight: '700'},
  bannerEmoji: {fontSize: 48},
  categoryWrapper: {paddingHorizontal: 12, marginBottom: 4},
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  catChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  catText: {fontSize: 12, fontWeight: '600', color: Colors.textMid},
  catTextActive: {color: Colors.white},
  grid: {paddingHorizontal: 12, paddingBottom: 100},
  resultCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
    marginTop: 6,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImageArea: {
    backgroundColor: Colors.primaryPale,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productEmoji: {fontSize: 54},
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {fontSize: 9, color: Colors.white, fontWeight: '700'},
  inCartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inCartText: {fontSize: 9, color: Colors.white, fontWeight: '700'},
  productInfo: {padding: 10},
  productName: {fontSize: 14, fontWeight: '700', color: Colors.text},
  productCategory: {fontSize: 10, color: Colors.textMuted, marginTop: 1},
  productPrice: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  variantRow: {flexDirection: 'row', gap: 4, marginTop: 6},
  variantChip: {
    flex: 1,
    backgroundColor: Colors.primaryPale,
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  variantText: {fontSize: 9, color: Colors.primary, fontWeight: '600'},
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  cartBarLeft: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cartBarCount: {fontSize: 13, color: Colors.white, fontWeight: '700'},
  cartBarText: {fontSize: 14, color: Colors.white, fontWeight: '700'},
  cartBarRight: {fontSize: 12, color: 'rgba(255,255,255,0.8)'},
});
