import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {deliveryOrderApi, deliveryAuthApi} from '../../services/api';

export default function QRScreen({navigation, route}) {
  const {order} = route.params || {};
  const [updating, setUpdating] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    deliveryAuthApi.getPerson().then(person => {
      if (person?.upiId) setUpiId(person.upiId);
    });
  }, []);

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Order not found!</Text>
      </SafeAreaView>
    );
  }

  // Build real UPI deep link for QR code
  const upiUri = `upi://pay?pa=${encodeURIComponent(
    upiId,
  )}&pn=${encodeURIComponent(order.name)}&am=${
    order.total
  }&cu=INR&tn=${encodeURIComponent('Order ' + order.id)}`;
  // Free QR code API — generates a scannable PNG
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiUri,
  )}`;

  const handlePaymentDone = () => {
    Alert.alert(
      'Payment Received?',
      `₹${order.total} online payment mila ${order.name} se?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm ✅',
          onPress: async () => {
            setUpdating(true);
            try {
              await deliveryOrderApi.updateStatus(order.id, {
                status: 'delivered',
                payment: 'online',
              });
              navigation.popToTop();
            } catch (err) {
              Alert.alert('Error', err.message || 'Update failed!');
            } finally {
              setUpdating(false);
            }
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>UPI Payment QR</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Customer ko ye QR scan karne ko bolo
        </Text>
        <Text style={styles.customerName}>
          {order.name} — ₹{order.total}
        </Text>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <Image
            source={{uri: qrImageUrl}}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <View style={styles.qrInfo}>
            <Text style={styles.upiId}>UPI ID: {upiId}</Text>
            <Text style={styles.qrAmount}>
              Amount: ₹{order.total} (pre-filled)
            </Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howBox}>
          <Text style={styles.howTitle}>📱 Kaise kaam karta hai</Text>
          {[
            `1. Customer koi bhi UPI app khole (GPay / PhonePe / Paytm)`,
            `2. QR code scan kare`,
            `3. Amount ₹${order.total} already filled hoga`,
            `4. Customer payment confirm kare`,
          ].map((step, i) => (
            <Text key={i} style={styles.howStep}>
              {step}
            </Text>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handlePaymentDone}
          disabled={updating}>
          {updating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.confirmBtnText}>
              ✅ Customer ne Pay kar diya — Mark Done
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 40,
  },
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
  headerTitle: {fontSize: 17, fontWeight: '700', color: Colors.white},
  content: {flex: 1, padding: 16, alignItems: 'center'},
  instruction: {fontSize: 13, color: Colors.textMuted, marginBottom: 4},
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {alignItems: 'center', marginTop: 14},
  upiId: {fontSize: 12, color: Colors.textMuted},
  qrAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  howBox: {
    backgroundColor: Colors.primaryPale,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  howTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  howStep: {
    fontSize: 12,
    color: Colors.textMid,
    marginBottom: 5,
    lineHeight: 18,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    elevation: 4,
  },
  confirmBtnText: {color: Colors.white, fontSize: 14, fontWeight: '800'},
});
