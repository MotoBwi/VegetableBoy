import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

const MOCK_ORDERS = [
  {
    id: 'ORD-2340',
    date: '01 May 2026',
    status: 'delivered',
    items: 3,
    total: '₹184 + ₹15',
    payment: 'Cash',
  },
  {
    id: 'ORD-2339',
    date: '30 Apr 2026',
    status: 'pending_price',
    items: 2,
    total: 'Pending ⏳',
    payment: '-',
  },
  {
    id: 'ORD-2338',
    date: '29 Apr 2026',
    status: 'delivered',
    items: 4,
    total: '₹220 + ₹15',
    payment: 'Online',
  },
];

const statusConfig = {
  delivered: {
    label: '✅ Delivered',
    bg: Colors.primaryPale,
    color: Colors.primary,
  },
  pending_price: {
    label: '⏳ Price Pending',
    bg: Colors.accentPale,
    color: Colors.accent,
  },
  failed: {label: '❌ Failed', bg: Colors.redPale, color: Colors.red},
};

export default function OrdersScreen({navigation}) {
  const renderOrder = ({item}) => {
    const st = statusConfig[item.status];
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', {order: item})}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>
              📅 {item.date} • {item.items} items
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
            Total: <Text style={styles.totalValue}>{item.total}</Text>
          </Text>
          <Text style={styles.orderPayment}>
            Payment: <Text style={styles.paymentValue}>{item.payment}</Text>
          </Text>
          <Text style={styles.detailsLink}>Details →</Text>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          {label: 'Total', value: MOCK_ORDERS.length, color: Colors.blue},
          {
            label: 'Delivered',
            value: MOCK_ORDERS.filter(o => o.status === 'delivered').length,
            color: Colors.primary,
          },
          {
            label: 'Pending',
            value: MOCK_ORDERS.filter(o => o.status === 'pending_price').length,
            color: Colors.accent,
          },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={MOCK_ORDERS}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
