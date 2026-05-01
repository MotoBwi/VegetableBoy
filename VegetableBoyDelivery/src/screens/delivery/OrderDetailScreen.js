import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

export default function OrderDetailScreen({navigation, route}) {
  const {order, orders, setOrders} = route.params;

  const handleFailed = () => {
    const updated = orders.map(o =>
      o.id === order.id ? {...o, status: 'failed'} : o,
    );
    setOrders(updated);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{order.name}</Text>
          <Text style={styles.headerSub}>{order.id}</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: order.status === 'delivered' ? Colors.greenPale : order.status === 'failed' ? Colors.redPale : Colors.yellowPale,
        }]}>
          <Text style={[styles.statusText, {
            color: order.status === 'delivered' ? Colors.green : order.status === 'failed' ? Colors.red : Colors.yellow,
          }]}>
            {order.status === 'delivered' ? '✅ Done' : order.status === 'failed' ? '❌ Failed' : '🕐 Pending'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Address + Phone */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Address</Text>
          <Text style={styles.addressText}>{order.address}</Text>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${order.phone}`)}>
            <Text style={styles.callBtnText}>📞 Call {order.phone}</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛒 Order Items</Text>
          {order.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, i < order.items.length - 1 && styles.itemBorder]}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemVariant}>{item.variant} × {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}
        </View>

        {/* Bill */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items Total</Text>
            <Text style={styles.billValue}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charge</Text>
            <Text style={[styles.billValue, {color: Colors.green}]}>₹{order.delivery}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total to Collect</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.collectBtn}
              onPress={() => navigation.navigate('Payment', {order, orders, setOrders})}>
              <Text style={styles.collectBtnText}>💳 Collect Payment — ₹{order.total}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.failedBtn} onPress={handleFailed}>
              <Text style={styles.failedBtnText}>❌ Customer Not Available</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'delivered' && (
          <View style={styles.doneBox}>
            <Text style={styles.doneEmoji}>✅</Text>
            <Text style={styles.doneTitle}>Delivered Successfully!</Text>
            <Text style={styles.doneSub}>
              Payment: {order.payment === 'cash' ? '💵 Cash Collected' : '📱 Online Received'}
            </Text>
          </View>
        )}

        {order.status === 'failed' && (
          <View style={styles.failedBox}>
            <Text style={styles.failedEmoji}>❌</Text>
            <Text style={styles.failedTitle}>Delivery Failed</Text>
            <Text style={styles.failedSub}>Customer was not available</Text>
          </View>
        )}

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
  headerTitle: {fontSize: 15, fontWeight: '700', color: Colors.white},
  headerSub: {fontSize: 11, color: 'rgba(255,255,255,0.7)'},
  statusBadge: {
    marginLeft: 'auto', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: {fontSize: 11, fontWeight: '700'},
  scroll: {padding: 14, gap: 12},
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardTitle: {fontSize: 13, fontWeight: '700', color: Colors.textMid, marginBottom: 12, letterSpacing: 0.5},
  addressText: {fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 12},
  callBtn: {
    backgroundColor: Colors.primaryPale, borderRadius: 10,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  callBtnText: {fontSize: 14, color: Colors.primary, fontWeight: '700'},
  itemRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8},
  itemBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  itemEmoji: {fontSize: 26},
  itemInfo: {flex: 1},
  itemName: {fontSize: 13, fontWeight: '700', color: Colors.text},
  itemVariant: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  itemPrice: {fontSize: 14, fontWeight: '700', color: Colors.text},
  billRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  billLabel: {fontSize: 13, color: Colors.textMid},
  billValue: {fontSize: 13, color: Colors.text, fontWeight: '600'},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: 8},
  totalLabel: {fontSize: 15, fontWeight: '800', color: Colors.text},
  totalValue: {fontSize: 15, fontWeight: '800', color: Colors.primary},
  actionSection: {gap: 10},
  collectBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', elevation: 4,
  },
  collectBtnText: {color: Colors.white, fontSize: 15, fontWeight: '800'},
  failedBtn: {
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.red,
  },
  failedBtnText: {color: Colors.red, fontSize: 14, fontWeight: '700'},
  doneBox: {
    backgroundColor: Colors.greenPale, borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.greenBorder,
  },
  doneEmoji: {fontSize: 40, marginBottom: 8},
  doneTitle: {fontSize: 16, fontWeight: '800', color: Colors.green},
  doneSub: {fontSize: 13, color: Colors.textMuted, marginTop: 4},
  failedBox: {
    backgroundColor: Colors.redPale, borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2',
  },
  failedEmoji: {fontSize: 40, marginBottom: 8},
  failedTitle: {fontSize: 16, fontWeight: '800', color: Colors.red},
  failedSub: {fontSize: 13, color: Colors.textMuted, marginTop: 4},
});
