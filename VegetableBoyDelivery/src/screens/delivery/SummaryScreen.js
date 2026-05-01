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
  const totalCash = delivered.filter(o => o.payment === 'cash').reduce((a, o) => a + o.total, 0);
  const totalOnline = delivered.filter(o => o.payment === 'online').reduce((a, o) => a + o.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💼 End of Day Summary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            {icon: '📦', label: 'Total Orders', value: (orders || []).length, color: Colors.primary},
            {icon: '✅', label: 'Delivered', value: delivered.length, color: Colors.green},
            {icon: '❌', label: 'Failed', value: failed.length, color: Colors.red},
            {icon: '🕐', label: 'Pending', value: pending.length, color: Colors.yellow},
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Collection Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Collection Summary</Text>
          <View style={styles.collectionRow}>
            <View style={styles.collectionItem}>
              <Text style={styles.collectionIcon}>💵</Text>
              <Text style={styles.collectionLabel}>Cash Collected</Text>
              <Text style={[styles.collectionAmount, {color: Colors.green}]}>₹{totalCash}</Text>
              <View style={styles.submitTag}>
                <Text style={styles.submitTagText}>Submit to Admin</Text>
              </View>
            </View>
            <View style={styles.collectionDivider} />
            <View style={styles.collectionItem}>
              <Text style={styles.collectionIcon}>📱</Text>
              <Text style={styles.collectionLabel}>Online Received</Text>
              <Text style={[styles.collectionAmount, {color: Colors.primary}]}>₹{totalOnline}</Text>
              <View style={[styles.submitTag, {backgroundColor: Colors.primaryPale}]}>
                <Text style={[styles.submitTagText, {color: Colors.primary}]}>Direct to Company</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Revenue Today</Text>
          <Text style={styles.totalAmount}>₹{totalCash + totalOnline}</Text>
        </View>

        {/* Per Order Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Order Breakdown</Text>
          {(orders || []).map((order, i) => (
            <View key={order.id} style={[styles.orderRow, i < (orders || []).length - 1 && styles.orderBorder]}>
              <View style={styles.orderLeft}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={[styles.orderStatus, {
                  color: order.status === 'delivered' ? Colors.green : order.status === 'failed' ? Colors.red : Colors.yellow,
                }]}>
                  {order.status === 'delivered' ? '✅' : order.status === 'failed' ? '❌' : '🕐'}
                </Text>
                {order.status === 'delivered' && (
                  <Text style={styles.orderPayment}>
                    {order.payment === 'cash' ? '💵' : '📱'} ₹{order.total}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Submit Alert */}
        {totalCash > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              ⚠️ ₹{totalCash} cash admin ko aaj submit karna hai!
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Back to Deliveries</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    backgroundColor: Colors.primary, flexDirection: 'row',
    alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  backText: {fontSize: 20, color: Colors.white, fontWeight: '700'},
  headerTitle: {fontSize: 16, fontWeight: '700', color: Colors.white},
  scroll: {padding: 14, gap: 14},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statIcon: {fontSize: 24, marginBottom: 6},
  statValue: {fontSize: 28, fontWeight: '900'},
  statLabel: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: {fontSize: 13, fontWeight: '700', color: Colors.textMid, marginBottom: 14, letterSpacing: 0.5},
  collectionRow: {flexDirection: 'row', alignItems: 'center'},
  collectionItem: {flex: 1, alignItems: 'center', padding: 8},
  collectionDivider: {width: 1, height: 80, backgroundColor: Colors.border},
  collectionIcon: {fontSize: 28, marginBottom: 6},
  collectionLabel: {fontSize: 12, color: Colors.textMuted},
  collectionAmount: {fontSize: 30, fontWeight: '900', marginTop: 4},
  submitTag: {
    marginTop: 8, backgroundColor: Colors.greenPale,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  submitTagText: {fontSize: 10, color: Colors.green, fontWeight: '700'},
  totalCard: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 20,
    alignItems: 'center',
  },
  totalLabel: {fontSize: 13, color: 'rgba(255,255,255,0.7)'},
  totalAmount: {fontSize: 40, fontWeight: '900', color: Colors.white, marginTop: 4},
  orderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10},
  orderBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  orderLeft: {},
  orderName: {fontSize: 13, fontWeight: '700', color: Colors.text},
  orderId: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  orderRight: {alignItems: 'flex-end'},
  orderStatus: {fontSize: 18},
  orderPayment: {fontSize: 12, color: Colors.textMid, marginTop: 2},
  alertBox: {
    backgroundColor: Colors.greenPale, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.greenBorder,
  },
  alertText: {fontSize: 13, color: Colors.green, fontWeight: '700', textAlign: 'center'},
  closeBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', elevation: 4, marginBottom: 20,
  },
  closeBtnText: {color: Colors.white, fontSize: 15, fontWeight: '700'},
});
