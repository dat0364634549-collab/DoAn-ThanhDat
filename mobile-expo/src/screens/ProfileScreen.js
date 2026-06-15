import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoutVisible, setLogoutVisible] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      setMessage('Họ tên không được để trống.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Đã cập nhật thông tin.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutVisible(false);
    await logout();
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
          <Text style={styles.title}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.form}>
            <FormField label="Họ và tên" value={form.name} onChangeText={(v) => update('name', v)} />
            <FormField label="Số điện thoại" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" style={styles.field} />
            <FormField label="Địa chỉ" value={form.address} onChangeText={(v) => update('address', v)} multiline style={styles.field} />
            {message ? <Text style={[styles.message, message.startsWith('Đã') && styles.success]}>{message}</Text> : null}
            <PrimaryButton title="Lưu thay đổi" onPress={save} loading={loading} style={styles.button} />
            <PrimaryButton title="Đăng xuất" onPress={() => setLogoutVisible(true)} variant="outline" style={styles.logout} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setLogoutVisible(false)}>
          <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.dialogTitle}>Đăng xuất</Text>
            <Text style={styles.dialogText}>Bạn có chắc muốn đăng xuất khỏi tài khoản?</Text>
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setLogoutVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable onPress={handleLogout} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40
  },
  avatar: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 10, borderRadius: 44, backgroundColor: colors.primaryDark },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  title: { marginTop: 13, color: colors.text, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  email: { marginTop: 4, color: colors.muted, textAlign: 'center' },
  form: { marginTop: 28, padding: 19, borderRadius: 18, backgroundColor: '#fff' },
  field: { marginTop: 16 },
  message: { marginTop: 16, color: colors.danger, textAlign: 'center' },
  success: { color: colors.success },
  button: { marginTop: 20 },
  logout: { marginTop: 12 },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.55)'
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#fff'
  },
  dialogTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center'
  },
  dialogText: {
    marginTop: 10,
    color: colors.muted,
    lineHeight: 21,
    textAlign: 'center'
  },
  dialogActions: {
    flexDirection: 'row',
    marginTop: 22
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    marginRight: 6,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.danger
  },
  cancelText: {
    color: colors.text,
    fontWeight: '800'
  },
  confirmText: {
    color: '#fff',
    fontWeight: '900'
  }
});
