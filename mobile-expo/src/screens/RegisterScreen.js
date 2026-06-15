import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const initialForm = { name: '', email: '', phone: '', address: '', password: '', confirm: '' };

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Họ tên, email và mật khẩu là bắt buộc.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Email chưa đúng định dạng.');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { confirm, ...payload } = form;
      await register(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Thông tin này sẽ được dùng khi đặt hàng.</Text>
          <FormField label="Họ và tên *" value={form.name} onChangeText={(v) => update('name', v)} />
          <FormField label="Email *" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" style={styles.field} />
          <FormField label="Số điện thoại" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" style={styles.field} />
          <FormField label="Địa chỉ" value={form.address} onChangeText={(v) => update('address', v)} style={styles.field} />
          <FormField label="Mật khẩu *" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry style={styles.field} />
          <FormField label="Nhập lại mật khẩu *" value={form.confirm} onChangeText={(v) => update('confirm', v)} secureTextEntry style={styles.field} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Đăng ký" onPress={submit} loading={loading} style={styles.button} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 50 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { marginTop: 7, marginBottom: 28, color: colors.muted },
  field: { marginTop: 16 },
  error: { marginTop: 16, color: colors.danger, textAlign: 'center' },
  button: { marginTop: 22 }
});
