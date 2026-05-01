import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {Colors} from '../../theme/colors';

export default function LoginScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Phone aur password dono bharo!');
      return;
    }
    if (phone === '9700001111' && password === 'delivery123') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.replace('Home');
      }, 1000);
    } else {
      Alert.alert('Error', 'Wrong credentials!\nUse 9700001111 / delivery123');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Top Blue Section */}
      <View style={styles.topSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🚴</Text>
        </View>
        <Text style={styles.appName}>Vegetable Boy</Text>
        <Text style={styles.roleText}>DELIVERY PARTNER APP</Text>
        <Text style={styles.tagline}>Fresh Vegetables, Daily Delivery</Text>
      </View>

      {/* Form */}
      <View style={styles.formSection}>
        <Text style={styles.welcomeText}>Delivery Login 👋</Text>
        <Text style={styles.subText}>Apne delivery account mein login karo</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>📱 Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>🔒 Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && {opacity: 0.7}]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={styles.loginBtnText}>
            {loading ? 'Logging in...' : '🚴 Start Delivery →'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔐 Credentials admin ke dwara assign hote hain
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.primary},
  topSection: {
    flex: 0.45, alignItems: 'center',
    justifyContent: 'center', paddingTop: 40,
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {fontSize: 48},
  appName: {fontSize: 24, fontWeight: '800', color: Colors.white},
  roleText: {
    fontSize: 10, color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3, marginTop: 4,
  },
  tagline: {fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6},
  formSection: {
    flex: 0.55, backgroundColor: Colors.white,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingTop: 32,
  },
  welcomeText: {fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4},
  subText: {fontSize: 13, color: Colors.textMuted, marginBottom: 24},
  inputWrapper: {marginBottom: 16},
  inputLabel: {fontSize: 12, fontWeight: '700', color: Colors.textMid, marginBottom: 6},
  input: {
    backgroundColor: Colors.bg, borderRadius: 12,
    padding: 14, fontSize: 15, color: Colors.text,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8, elevation: 6,
  },
  loginBtnText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
  infoBox: {
    marginTop: 20, backgroundColor: Colors.primaryPale,
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  infoText: {fontSize: 12, color: Colors.primary, textAlign: 'center', fontWeight: '600'},
});
