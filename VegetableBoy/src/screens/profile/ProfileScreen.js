import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {userAuthApi} from '../../services/api';

export default function ProfileScreen({navigation}) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    block: '',
    building: '',
    flat: '',
    image: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const u = await userAuthApi.me();
      setUser(u);
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        block: u.block || '',
        building: u.building || '',
        flat: u.flat || '',
        image: u.image || '',
      });
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name required hai!');
      return;
    }
    setSaving(true);
    try {
      await userAuthApi.updateProfile(form);
      Alert.alert('Saved! ✅', 'Profile update ho gaya!');
      setEditing(false);
      loadUser();
    } catch (err) {
      Alert.alert('Error', err.message || 'Save nahi ho paya!');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout?', 'Aap sure ho?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await userAuthApi.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}
        edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {form.image ? (
            <Image source={{uri: form.image}} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(form.name || user?.name || 'U').charAt(0)}
              </Text>
            </View>
          )}
          {editing && (
            <TextInput
              style={[styles.input, styles.imageInput]}
              placeholder="Image URL (optional)"
              placeholderTextColor={Colors.textMuted}
              value={form.image}
              onChangeText={text => setForm(f => ({...f, image: text}))}
            />
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Details</Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editLink}>Edit ✏️</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.editLink}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <View style={styles.form}>
              <Field
                label="Full Name"
                value={form.name}
                onChange={v => setForm(f => ({...f, name: v}))}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={v => setForm(f => ({...f, phone: v}))}
                keyboard="phone-pad"
              />
              <Field
                label="Block"
                value={form.block}
                onChange={v => setForm(f => ({...f, block: v}))}
              />
              <Field
                label="Building"
                value={form.building}
                onChange={v => setForm(f => ({...f, building: v}))}
              />
              <Field
                label="Flat No."
                value={form.flat}
                onChange={v => setForm(f => ({...f, flat: v}))}
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && {opacity: 0.7}]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes ✅</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoList}>
              <InfoRow label="Name" value={user?.name} />
              <InfoRow label="Phone" value={user?.phone} />
              <InfoRow label="Block" value={user?.block} />
              <InfoRow label="Building" value={user?.building} />
              <InfoRow label="Flat No." value={user?.flat} />
              <InfoRow label="Zone" value={user?.zone} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({label, value, onChange, keyboard}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard || 'default'}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

function InfoRow({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
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
  headerTitle: {fontSize: 17, fontWeight: '700', color: Colors.white},
  logoutText: {fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600'},
  scroll: {padding: 14, gap: 14},
  avatarSection: {alignItems: 'center', marginVertical: 10},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {fontSize: 40, fontWeight: '800', color: Colors.primary},
  imageInput: {marginTop: 10, textAlign: 'center'},
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {fontSize: 13, fontWeight: '700', color: Colors.text},
  editLink: {fontSize: 13, color: Colors.primary, fontWeight: '700'},
  form: {gap: 12},
  field: {},
  fieldLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.bg,
  },
  infoList: {gap: 10},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {fontSize: 13, color: Colors.textMuted},
  infoValue: {fontSize: 13, fontWeight: '700', color: Colors.text},
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {color: Colors.white, fontSize: 15, fontWeight: '800'},
});
