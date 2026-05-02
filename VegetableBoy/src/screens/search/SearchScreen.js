import React, {useState, useEffect, useCallback} from 'react';
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
import {productApi} from '../../services/api';

export default function SearchScreen({navigation}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const CATEGORIES = ['All', 'Staple', 'Leafy', 'Spicy', 'Seasonal', 'Root'];

  useEffect(() => {
    productApi
      .getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const renderProduct = ({item, index}) => {
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isLeft ? {marginRight: 6} : {marginLeft: 6},
        ]}
        onPress={() => navigation.navigate('ProductDetail', {product: item})}>
        <View style={styles.productImageArea}>
          <Text style={styles.productEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>
            ₹{item.price250} / ₹{item.price500} / ₹{item.price1kg}
          </Text>
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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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

      <FlatList
        data={filtered}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </Text>
        }
        ListEmptyComponent={
          <View style={{alignItems: 'center', paddingVertical: 60}}>
            <Text style={{fontSize: 48, marginBottom: 12}}>🔍</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Colors.textMuted,
              }}>
              No vegetables found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    backgroundColor: Colors.primary,
    padding: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    margin: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {fontSize: 18},
  searchInput: {flex: 1, fontSize: 15, color: Colors.text},
  clearIcon: {fontSize: 16, color: Colors.textMuted, padding: 4},
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
  },
  productEmoji: {fontSize: 54},
  productInfo: {padding: 10},
  productName: {fontSize: 14, fontWeight: '700', color: Colors.text},
  productCategory: {fontSize: 10, color: Colors.textMuted, marginTop: 1},
  productPrice: {
    fontSize: 11,
    color: Colors.primary,
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
});
