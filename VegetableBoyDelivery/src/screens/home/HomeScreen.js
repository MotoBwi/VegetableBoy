import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../theme/colors';
import {
  deliveryOrderApi,
  deliveryAuthApi,
  deliverySelfApi,
} from '../../services/api';

const statusConfig = {
  pending: {
    label: '🕐 Pending',
    bg: Colors.yellowPale,
    color: Colors.yellow,
    border: '#FFE082',
  },
  delivered: {
    label: '✅ Delivered',
    bg: Colors.greenPale,
    color: Colors.green,
    border: Colors.greenBorder,
  },
  failed: {
    label: '❌ Failed',
    bg: Colors.redPale,
    color: Colors.red,
    border: '#FFCDD2',
  },
};

export default function HomeScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [person, setPerson] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersData, selfData] = await Promise.all([
        deliveryOrderApi.getOrders(),
        deliverySelfApi.getProfile(),
      ]);
      setOrders(ordersData);
      setPerson(selfData.person);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load orders');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const delivered = orders.filter(o => o.status === 'delivered');
  const pending = orders.filter(o => o.status === 'pending');
  const failed = orders.filter(o => o.status === 'failed');

  const zoneLabel =
    person?.zones?.length > 0
      ? person.zones.map(z => z.name).join(', ')
      : 'No zones assigned';

  const renderOrder = ({item}) => {
    const st = statusConfig[item.status];
    return (
      <TouchableOpacity
        style={[styles.orderCard, {borderLeftColor: st.color}]}
        onPress={() => navigation.navigate('OrderDetail', {order: item})}>
        <View style={styles.orderTop}>
          <View style={styles.orderLeft}>
            <Text style={styles.orderName}>{item.name}</Text>
            <Text style={styles.orderAddress} numberOfLines={1}>
              📍 {item.address}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: st.bg, borderColor: st.border},
            ]}>
            <Text style={[styles.statusText, {color: st.color}]}>
              {st.label}
            </Text>
          </View>
        </View>
        <View style={styles.orderDivider} />
        <View style={styles.orderBottom}>
          <Text style={styles.orderMeta}>{item.items.length} items</Text>
          <Text style={styles.viewText}>View →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarEmoji}>🚴</Text>
          </View>
          <View>
            <Text style={styles.headerName}>
              {person?.name || 'Delivery Partner'}
            </Text>
            <Text style={styles.headerZone}>📍 {zoneLabel}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.summaryBtn}
          onPress={() => navigation.navigate('Summary', {orders})}>
          <Text style={styles.summaryBtnText}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          {
            label: 'Total',
            value: orders.length,
            color: Colors.white,
            bg: 'rgba(255,255,255,0.15)',
          },
          {
            label: 'Delivered',
            value: delivered.length,
            color: '#A5D6A7',
            bg: 'rgba(165,214,167,0.2)',
          },
          {
            label: 'Pending',
            value: pending.length,
            color: '#FFE082',
            bg: 'rgba(255,224,130,0.2)',
          },
          {
            label: 'Failed',
            value: failed.length,
            color: '#EF9A9A',
            bg: 'rgba(239,154,154,0.2)',
          },
        ].map(s => (
          <View
            key={s.label}
            style={[styles.statCard, {backgroundColor: s.bg}]}>
            <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <Text style={styles.listHeader}>Today's Deliveries</Text>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>📭 No pending orders!</Text>
              <Text style={styles.emptySub}>
                Check back later or pull down to refresh.
              </Text>
            </View>
          )
        }
      />

      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💼 End of Day Summary</Text>
              <TouchableOpacity
                onPress={() => setShowSummary(false)}
                style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryGrid}>
              {[
                {
                  label: 'Total',
                  value: orders.length,
                  icon: '📦',
                  color: Colors.primary,
                },
                {
                  label: 'Delivered',
                  value: delivered.length,
                  icon: '✅',
                  color: Colors.green,
                },
                {
                  label: 'Failed',
                  value: failed.length,
                  icon: '❌',
                  color: Colors.red,
                },
                {
                  label: 'Pending',
                  value: pending.length,
                  icon: '🕐',
                  color: Colors.yellow,
                },
              ].map(s => (
                <View key={s.label} style={styles.summaryStatCard}>
                  <Text style={styles.summaryStatIcon}>{s.icon}</Text>
                  <Text style={[styles.summaryStatValue, {color: s.color}]}>
                    {s.value}
                  </Text>
                  <Text style={styles.summaryStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowSummary(false)}>
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {fontSize: 20},
  headerName: {fontSize: 15, fontWeight: '700', color: Colors.white},
  headerZone: {fontSize: 11, color: 'rgba(255,255,255,0.7)'},
  summaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryBtnText: {fontSize: 12, color: Colors.white, fontWeight: '700'},
  profileBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileBtnText: {fontSize: 16},
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {fontSize: 22, fontWeight: '900'},
  statLabel: {fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2},
  list: {padding: 14, paddingBottom: 30},
  listHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMid,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyBox: {alignItems: 'center', marginTop: 40},
  emptyText: {fontSize: 16, fontWeight: '700', color: Colors.textMid},
  emptySub: {fontSize: 12, color: Colors.textMuted, marginTop: 6},
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderLeft: {flex: 1, marginRight: 8},
  orderName: {fontSize: 15, fontWeight: '800', color: Colors.text},
  orderAddress: {fontSize: 11, color: Colors.textMuted, marginTop: 3},
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusText: {fontSize: 10, fontWeight: '700'},
  orderDivider: {height: 1, backgroundColor: Colors.border, marginVertical: 10},
  orderBottom: {flexDirection: 'row', alignItems: 'center', gap: 8},
  orderMeta: {fontSize: 12, color: Colors.textMuted},
  viewText: {fontSize: 12, color: Colors.primary, fontWeight: '700'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {fontSize: 17, fontWeight: '800', color: Colors.text},
  closeBtn: {
    backgroundColor: Colors.border,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {fontSize: 14, color: Colors.textMid},
  summaryGrid: {flexDirection: 'row', gap: 10, marginBottom: 16},
  summaryStatCard: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryStatIcon: {fontSize: 20, marginBottom: 4},
  summaryStatValue: {fontSize: 22, fontWeight: '900'},
  summaryStatLabel: {fontSize: 10, color: Colors.textMuted, marginTop: 2},
  closeModalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  closeModalBtnText: {color: Colors.white, fontSize: 15, fontWeight: '700'},
});
