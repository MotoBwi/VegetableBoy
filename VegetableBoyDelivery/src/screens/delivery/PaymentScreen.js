import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';

export default function PaymentScreen({navigation, route}) {
  const {order, orders, setOrders} = route.params;
  const [selectedMode, setSelectedMode] = useState(null);

  const handleConfirmCash = () => {
    Alert.alert(
      'Confirm Cash Collection?',
      `₹${order.total} cash liya ${order.name} se?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm ✅',
          onPress: () => {
            const updated = orders.map(o =>
              o.id === order.id ? {...o, status: 'delivered', payment: 'cash'} : o,
            );
            setOrders(updated);
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const handleOnline = () => {
    navigation.navigate('QR', {order, orders, setOrders});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collect Payment</Text>
      </View>

      <View style={styles.content}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Collect from</Text>
          <Text style={styles.customerName}>{order.name}</Text>
          <Text style={styles.amount}>₹{order.total}</Text>
          <View style={styles.amountBreakup}>
            <Text style={styles.breakupText}>Items: ₹{order.subtotal} + Delivery: ₹{order.delivery}</Text>
          </View>
        </View>

        {/* Payment Mode */}
        <Text style={styles.modeTitle}>Select Payment Mode</Text>
        <View style={styles.modeRow}>
          {[
            {mode: 'cash', icon: '💵', label: 'Cash', desc: 'Customer pays cash', color: Colors.green},
            {mode: 'online', icon: '📱', label: 'Online UPI', desc: 'Show QR to customer', color: Colors.primary},
          ].map(p => (
            <TouchableOpacity
              key={p.mode}
              style={[
                styles.modeCard,
                selectedMode === p.mode && {
                  borderColor: p.color,
                  backgroundColor: p.mode === 'cash' ? Colors.greenPale : Colors.primaryPale,
                },
              ]}
              onPress={() => setSelectedMode(p.mode)}>
              <Text style={styles.modeIcon}>{p.icon}</Text>
              <Text style={[styles.modeLabel, selectedMode === p.mode && {color: p.color}]}>
                {p.label}
              </Text>
              <Text style={styles.modeDesc}>{p.desc}</Text>
              {selectedMode === p.mode && (
                <View style={[styles.selectedDot, {backgroundColor: p.color}]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        {selectedMode && (
          <TouchableOpacity
            style={[styles.confirmBtn, {
              backgroundColor: selectedMode === 'cash' ? Colors.green : Colors.primary,
            }]}
            onPress={selectedMode === 'cash' ? handleConfirmCash : handleOnline}>
            <Text style={styles.confirmBtnText}>
              {selectedMode === 'cash' ? '✅ Confirm Cash Received' : '📱 Show QR Code →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerTitle: {fontSize: 17, fontWeight: '700', color: Colors.white},
  content: {flex: 1, padding: 16},
  amountCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  amountLabel: {fontSize: 13, color: Colors.textMuted, marginBottom: 4},
  customerName: {fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 12},
  amount: {fontSize: 48, fontWeight: '900', color: Colors.primary},
  amountBreakup: {
    marginTop: 10, backgroundColor: Colors.primaryPale,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6,
  },
  breakupText: {fontSize: 12, color: Colors.primary},
  modeTitle: {fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 14},
  modeRow: {flexDirection: 'row', gap: 12, marginBottom: 24},
  modeCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16,
    padding: 18, alignItems: 'center', borderWidth: 2, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  modeIcon: {fontSize: 36, marginBottom: 8},
  modeLabel: {fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4},
  modeDesc: {fontSize: 11, color: Colors.textMuted, textAlign: 'center'},
  selectedDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5,
  },
  confirmBtn: {
    borderRadius: 14, padding: 16,
    alignItems: 'center', elevation: 4,
  },
  confirmBtnText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
});
