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

export default function OrderDetailScreen({navigation, route}) {
  const {order} = route.params;
  const isDelivered = order.status === 'delivered';
  const isPaymentFailed = order.status === 'payment_failed';

  const itemsTotal =
    order.items?.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + price * item.qty;
    }, 0) || 0;

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
        <Text style={styles.headerTitle}>Order {order.id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status */}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: isDelivered
                ? Colors.primaryPale
                : isPaymentFailed
                ? Colors.redPale
                : Colors.accentPale,
              borderColor: isDelivered
                ? Colors.primaryBorder
                : isPaymentFailed
                ? '#FFCDD2'
                : '#FFE0B2',
            },
          ]}>
          <Text style={styles.statusEmoji}>
            {isDelivered ? '✅' : isPaymentFailed ? '❌' : '⏳'}
          </Text>
          <View>
            <Text
              style={[
                styles.statusTitle,
                {
                  color: isDelivered
                    ? Colors.primary
                    : isPaymentFailed
                    ? Colors.red
                    : Colors.accent,
                },
              ]}>
              {isDelivered
                ? 'Order Delivered!'
                : isPaymentFailed
                ? 'Payment Failed'
                : 'Order Pending'}
            </Text>
            <Text style={styles.statusSub}>
              {isDelivered
                ? `Delivered on ${new Date(order.createdAt).toLocaleDateString(
                    'en-IN',
                  )}`
                : isPaymentFailed
                ? 'Order was not placed. Please try again.'
                : 'Your order will be assigned for delivery soon'}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items?.map((item, i) => (
            <View
              key={i}
              style={[
                styles.itemRow,
                i < order.items.length - 1 && styles.itemBorder,
              ]}>
              <Text style={styles.itemEmoji}>{item.image ? '' : '🥗'}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemVariant}>
                  {item.variant} × {item.qty}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemPrice,
                  !isDelivered && {color: Colors.accent},
                ]}>
                {isDelivered ? `₹${(item.price || 0) * item.qty}` : 'Pending'}
              </Text>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items Total</Text>
            <Text
              style={[
                styles.billValue,
                !isDelivered && !isPaymentFailed && {color: Colors.accent},
              ]}>
              {isDelivered || isPaymentFailed ? `₹${itemsTotal}` : 'Pending ⏳'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charge</Text>
            <Text style={[styles.billValue, {color: Colors.primary}]}>
              ₹{order.deliveryCharge || 15}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
          {isDelivered && (
            <View style={styles.paymentBox}>
              <Text style={styles.paymentText}>
                {order.payment === 'cash'
                  ? '💵 Paid via Cash'
                  : order.payment === 'online'
                  ? '📱 Paid via Online UPI'
                  : '💳 Payment pending'}
              </Text>
            </View>
          )}
          {isPaymentFailed && (
            <View
              style={[styles.paymentBox, {backgroundColor: Colors.redPale}]}>
              <Text style={[styles.paymentText, {color: Colors.red}]}>
                ❌ Payment Failed — Order not placed
              </Text>
            </View>
          )}
        </View>

        {/* Delivery Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Date</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏰ Slot</Text>
            <Text style={styles.infoValue}>8:00 AM</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Zone</Text>
            <Text style={styles.infoValue}>{order.zone || '—'}</Text>
          </View>
          {order.deliveryPerson && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🚚 Delivery Person</Text>
              <Text style={styles.infoValue}>{order.deliveryPerson}</Text>
            </View>
          )}
        </View>

        {/* Payment Failed Details */}
        {isPaymentFailed && (
          <View
            style={[styles.card, {borderColor: Colors.red, borderWidth: 1}]}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Razorpay Order ID</Text>
              <Text style={styles.infoValue}>
                {order.razorpayOrderId || '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Failure Reason</Text>
              <Text
                style={[
                  styles.infoValue,
                  {color: Colors.red, flex: 1, textAlign: 'right'},
                ]}>
                {order.failureReason || 'Unknown'}
              </Text>
            </View>
          </View>
        )}
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
  scroll: {padding: 14, gap: 14},
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  statusEmoji: {fontSize: 32},
  statusTitle: {fontSize: 15, fontWeight: '700'},
  statusSub: {fontSize: 12, color: Colors.textMuted, marginTop: 3},
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
    color: Colors.text,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  itemBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  itemEmoji: {fontSize: 26},
  itemInfo: {flex: 1},
  itemName: {fontSize: 13, fontWeight: '700', color: Colors.text},
  itemVariant: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  itemPrice: {fontSize: 13, fontWeight: '700', color: Colors.text},
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {fontSize: 13, color: Colors.textMid},
  billValue: {fontSize: 13, color: Colors.text, fontWeight: '600'},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: 8},
  totalLabel: {fontSize: 15, fontWeight: '800', color: Colors.text},
  totalValue: {fontSize: 15, fontWeight: '800', color: Colors.primary},
  paymentBox: {
    marginTop: 10,
    backgroundColor: Colors.primaryPale,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  paymentText: {fontSize: 13, color: Colors.primary, fontWeight: '600'},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {fontSize: 13, color: Colors.textMuted},
  infoValue: {fontSize: 13, fontWeight: '600', color: Colors.text},
});
