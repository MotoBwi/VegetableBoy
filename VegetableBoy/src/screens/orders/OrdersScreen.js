import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {userOrderApi} from '../../services/api';

const statusConfig = {
  delivered: {
    label: '✅ Delivered',
    bg: Colors.primaryPale,
    color: Colors.primary,
  },
  pending: {
    label: '⏳ Pending',
    bg: Colors.accentPale,
    color: Colors.accent,
  },
  failed: {label: '❌ Failed', bg: Colors.redPale, color: Colors.red},
  payment_failed: {
    label: '❌ Payment Failed',
    bg: Colors.redPale,
    color: Colors.red,
  },
};

const DATE_RANGES = [
  {label: 'Last 1 Month', days: 30},
  {label: 'Last 3 Months', days: 90},
  {label: 'All Time', days: null},
];

export default function OrdersScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rangeIndex, setRangeIndex] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await userOrderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const selectedRange = DATE_RANGES[rangeIndex];

  const filteredOrders = orders.filter(order => {
    if (!selectedRange.days) return true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedRange.days);
    return new Date(order.createdAt) >= cutoff;
  });

  // Sort latest to oldest
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const renderOrder = ({item}) => {
    const st = statusConfig[item.status] || statusConfig.pending;
    const itemCount = item.items?.length || 0;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', {order: item})}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>
              📅 {new Date(item.createdAt).toLocaleDateString('en-IN')} •{' '}
              {itemCount} items
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: st.bg}]}>
            <Text style={[styles.statusText, {color: st.color}]}>
              {st.label}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.orderBottom}>
          <Text style={styles.orderTotal}>
            Total: <Text style={styles.totalValue}>₹{item.total}</Text>
          </Text>
          <Text style={styles.orderPayment}>
            Payment:{' '}
            <Text style={styles.paymentValue}>
              {item.status === 'payment_failed'
                ? 'Failed'
                : item.payment === 'cash'
                ? 'Cash'
                : item.payment === 'online'
                ? 'Online'
                : '—'}
            </Text>
          </Text>
          <Text style={styles.detailsLink}>Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}
        edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          style={{marginTop: 12, color: Colors.textMuted, fontWeight: '600'}}>
          Loading orders...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterRow}>
        {DATE_RANGES.map((r, i) => (
          <TouchableOpacity
            key={r.label}
            style={[
              styles.filterChip,
              rangeIndex === i && styles.filterChipActive,
            ]}
            onPress={() => setRangeIndex(i)}>
            <Text
              style={[
                styles.filterText,
                rangeIndex === i && styles.filterTextActive,
              ]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          {label: 'Total', value: sortedOrders.length, color: Colors.blue},
          {
            label: 'Delivered',
            value: sortedOrders.filter(o => o.status === 'delivered').length,
            color: Colors.primary,
          },
          {
            label: 'Pending',
            value: sortedOrders.filter(o => o.status === 'pending').length,
            color: Colors.accent,
          },
          {
            label: 'Failed',
            value: sortedOrders.filter(o => o.status === 'payment_failed')
              .length,
            color: Colors.red,
          },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={sortedOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{alignItems: 'center', paddingVertical: 60}}>
            <Text style={{fontSize: 48, marginBottom: 12}}>📦</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Colors.textMuted,
              }}>
              No orders in this period
            </Text>
            <Text style={{fontSize: 13, color: Colors.textMuted, marginTop: 4}}>
              Try a different date range
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    margin: 12,
    marginBottom: 0,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {fontSize: 12, fontWeight: '600', color: Colors.textMid},
  filterTextActive: {color: Colors.white},
  statsRow: {
    flexDirection: 'row',
    margin: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {fontSize: 24, fontWeight: '900'},
  statLabel: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  list: {paddingHorizontal: 12, paddingBottom: 24},
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {fontSize: 14, fontWeight: '700', color: Colors.text},
  orderDate: {fontSize: 11, color: Colors.textMuted, marginTop: 3},
  statusBadge: {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  statusText: {fontSize: 11, fontWeight: '700'},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: 10},
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {fontSize: 12, color: Colors.textMuted},
  totalValue: {color: Colors.text, fontWeight: '700'},
  orderPayment: {fontSize: 12, color: Colors.textMuted},
  paymentValue: {color: Colors.text, fontWeight: '700'},
  detailsLink: {fontSize: 12, color: Colors.primary, fontWeight: '700'},
});
