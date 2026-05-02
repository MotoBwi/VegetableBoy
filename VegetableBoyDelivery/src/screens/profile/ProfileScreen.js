import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../theme/colors';
import {deliveryAuthApi, deliverySelfApi} from '../../services/api';

export default function ProfileScreen({navigation}) {
  const [person, setPerson] = useState(null);

  const loadData = async () => {
    try {
      const data = await deliverySelfApi.getProfile();
      setPerson(data.person);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load profile');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const handleLogout = () => {
    Alert.alert('Logout?', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await deliveryAuthApi.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const zoneLabel = person?.zones?.length
    ? person.zones.map(z => z.name).join(', ')
    : 'No zones assigned';

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
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🚴</Text>
          </View>
          <Text style={styles.name}>{person?.name || 'Delivery Partner'}</Text>
          <Text style={styles.phone}>{person?.phone || ''}</Text>
          <View style={styles.zoneBadge}>
            <Text style={styles.zoneText}>📍 {zoneLabel}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            {label: 'Zones', value: person?.zones?.length || 0},
            {label: 'ID', value: `#${person?.id || '--'}`},
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Vegetable Boy Delivery Partner App
        </Text>
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
  headerTitle: {fontSize: 17, fontWeight: '700', color: Colors.white},
  scroll: {padding: 16, gap: 14},
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  avatarEmoji: {fontSize: 40},
  name: {fontSize: 20, fontWeight: '800', color: Colors.text},
  phone: {fontSize: 14, color: Colors.textMid, marginTop: 4},
  zoneBadge: {
    marginTop: 10,
    backgroundColor: Colors.primaryPale,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  zoneText: {fontSize: 12, color: Colors.primary, fontWeight: '700'},
  statsRow: {flexDirection: 'row', gap: 10},
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {fontSize: 22, fontWeight: '900', color: Colors.primary},
  statLabel: {fontSize: 11, color: Colors.textMuted, marginTop: 2},
  logoutBtn: {
    backgroundColor: Colors.redPale,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 6,
  },
  logoutText: {fontSize: 15, fontWeight: '800', color: Colors.red},
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
