import React from 'react';
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

const QRGrid = ({amount}) => {
  const size = 20;
  const cells = Array.from({length: size * size}, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    const isCornerTL = r < 7 && c < 7;
    const isCornerTR = r < 7 && c >= size - 7;
    const isCornerBL = r >= size - 7 && c < 7;
    const isEdge = (rr, cc, sr, sc) =>
      (rr === sr || rr === sr + 6 || cc === sc || cc === sc + 6) &&
      rr >= sr && rr <= sr + 6 && cc >= sc && cc <= sc + 6;
    const isInnerTL = r >= 2 && r <= 4 && c >= 2 && c <= 4;
    const isInnerTR = r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3;
    const isInnerBL = r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4;
    const filled =
      isCornerTL ? (isEdge(r, c, 0, 0) || isInnerTL) :
      isCornerTR ? (isEdge(r, c, 0, size - 7) || isInnerTR) :
      isCornerBL ? (isEdge(r, c, size - 7, 0) || isInnerBL) :
      Math.random() > 0.55;
    return filled;
  });

  return (
    <View style={qrStyles.grid}>
      {cells.map((filled, i) => (
        <View key={i} style={[qrStyles.cell, filled && qrStyles.cellFilled]} />
      ))}
      <View style={qrStyles.centerLogo}>
        <Text style={qrStyles.centerEmoji}>🥦</Text>
      </View>
    </View>
  );
};

const qrStyles = StyleSheet.create({
  grid: {
    width: 200, height: 200,
    flexDirection: 'row', flexWrap: 'wrap',
    position: 'relative',
  },
  cell: {width: 10, height: 10, backgroundColor: 'transparent'},
  cellFilled: {backgroundColor: '#0D1B2A'},
  centerLogo: {
    position: 'absolute', top: '40%', left: '40%',
    backgroundColor: Colors.white, borderRadius: 8, padding: 4,
    borderWidth: 2, borderColor: Colors.border,
  },
  centerEmoji: {fontSize: 20},
});

export default function QRScreen({navigation, route}) {
  const {order, orders, setOrders} = route.params;

  const handlePaymentDone = () => {
    Alert.alert(
      'Payment Received?',
      `₹${order.total} online payment mila ${order.name} se?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm ✅',
          onPress: () => {
            const updated = orders.map(o =>
              o.id === order.id ? {...o, status: 'delivered', payment: 'online'} : o,
            );
            setOrders(updated);
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>UPI Payment QR</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Customer ko ye QR scan karne ko bolo</Text>
        <Text style={styles.customerName}>{order.name} — ₹{order.total}</Text>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <QRGrid amount={order.total} />
          <View style={styles.qrInfo}>
            <Text style={styles.upiId}>UPI ID: vegetableboy@upi</Text>
            <Text style={styles.qrAmount}>Amount: ₹{order.total} (pre-filled)</Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howBox}>
          <Text style={styles.howTitle}>📱 Kaise kaam karta hai</Text>
          {[
            `1. Customer koi bhi UPI app khhole (GPay / PhonePe / Paytm)`,
            `2. QR code scan kare`,
            `3. Amount ₹${order.total} already filled hoga`,
            `4. Customer payment confirm kare`,
          ].map((step, i) => (
            <Text key={i} style={styles.howStep}>{step}</Text>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handlePaymentDone}>
          <Text style={styles.confirmBtnText}>✅ Customer ne Pay kar diya — Mark Done</Text>
        </TouchableOpacity>
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
  content: {flex: 1, padding: 16, alignItems: 'center'},
  instruction: {fontSize: 13, color: Colors.textMuted, marginBottom: 4},
  customerName: {fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 20},
  qrCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  qrInfo: {alignItems: 'center', marginTop: 14},
  upiId: {fontSize: 12, color: Colors.textMuted},
  qrAmount: {fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 4},
  howBox: {
    backgroundColor: Colors.primaryPale, borderRadius: 12, padding: 14,
    width: '100%', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  howTitle: {fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 10},
  howStep: {fontSize: 12, color: Colors.textMid, marginBottom: 5, lineHeight: 18},
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', width: '100%', elevation: 4,
  },
  confirmBtnText: {color: Colors.white, fontSize: 14, fontWeight: '800'},
});
