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
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {userAuthApi} from '../../services/api';

export default function LoginScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Phone aur password dono bharo!');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Error', '10-digit phone number dalna zaroori hai!');
      return;
    }

    setLoading(true);
    try {
      const data = await userAuthApi.login(phone.trim(), password);
      if (data.user) {
        navigation.replace('Main');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.topSection}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.appName}>Vegetable Boy</Text>
        <Text style={styles.tagline}>Fresh Vegetables, Daily Delivery</Text>
      </View>
      <View style={styles.formSection}>
        <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
        <Text style={styles.subText}>Apne account mein login karo</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>📱 Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
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
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginBtnText}>Login →</Text>
          )}
        </TouchableOpacity>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔐 Account admin ke dwara create hoga
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.primary},
  topSection: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logo: {width: 80, height: 80, marginBottom: 12, borderRadius: 16},
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6},
  formSection: {
    flex: 0.6,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subText: {fontSize: 13, color: Colors.textMuted, marginBottom: 24},
  inputWrapper: {marginBottom: 16},
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMid,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 6,
  },
  loginBtnText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
  infoBox: {
    marginTop: 20,
    backgroundColor: Colors.primaryPale,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  infoText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
