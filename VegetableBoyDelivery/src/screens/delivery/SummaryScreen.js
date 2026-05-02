import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

export default function SummaryScreen({navigation, route}) {
  const {orders} = route.params || {};

  const delivered = (orders || []).filter(o => o.status === 'delivered');
  const failed = (orders || []).filter(o => o.status === 'failed');
  const pending = (orders || []).filter(o => o.status === 'pending');

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
        <Text style={styles.headerTitle}>💼 End of Day Summary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            {
              icon: '📦',
              label: 'Total Orders',
              value: (orders || []).length,
              color: Colors.primary,
            },
            {
              icon: '✅',
              label: 'Delivered',
              value: delivered.length,
              color: Colors.green,
            },
            {
              icon: '❌',
              label: 'Failed',
              value: failed.length,
              color: Colors.red,
            },
            {
              icon: '🕐',
              label: 'Pending',
              value: pending.length,
              color: Colors.yellow,
            },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, {color: s.color}]}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Order Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Order Breakdown</Text>
          {(orders || []).map((order, i) => (
            <View
              key={order.id}
              style={[
                styles.orderRow,
                i < (orders || []).length - 1 && styles.orderBorder,
              ]}>
              <View style={styles.orderLeft}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text
                  style={[
                    styles.orderStatus,
                    {
                      color:
                        order.status === 'delivered'
                          ? Colors.green
                          : order.status === 'failed'
                          ? Colors.red
                          : Colors.yellow,
                    },
                  ]}>
                  {order.status === 'delivered'
                    ? '✅'
                    : order.status === 'failed'
                    ? '❌'
                    : '🕐'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Back to Deliveries</Text>
        </TouchableOpacity>
      </ScrollView>
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
    gap: 12,
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
  headerTitle: {fontSize: 16, fontWeight: '700', color: Colors.white},
  scroll: {padding: 14, gap: 14},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {fontSize: 24, marginBottom: 6},
  statValue: {fontSize: 28, fontWeight: '900'},
  statLabel: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMid,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  orderBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  orderLeft: {},
  orderName: {fontSize: 13, fontWeight: '700', color: Colors.text},
  orderId: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  orderRight: {alignItems: 'flex-end'},
  orderStatus: {fontSize: 18},
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 20,
  },
  closeBtnText: {color: Colors.white, fontSize: 15, fontWeight: '700'},
});
