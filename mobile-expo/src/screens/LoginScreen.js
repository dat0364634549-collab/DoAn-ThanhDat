import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
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
          <View style={styles.logo}><Text style={styles.logoText}>TD</Text></View>
          <Text style={styles.title}>Thành Đạt Shop</Text>
          <Text style={styles.subtitle}>Đăng nhập để mua sắm và theo dõi đơn hàng</Text>
          <View style={styles.form}>
            <FormField
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="ban@example.com"
            />
            <FormField
              label="Mật khẩu"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) setError('');
              }}
              secureTextEntry
              placeholder="Nhập mật khẩu"
              style={styles.field}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Đăng nhập" onPress={submit} loading={loading} style={styles.button} />
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.register}>Chưa có tài khoản? <Text style={styles.link}>Đăng ký ngay</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    padding: 24
  },
  logo: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: colors.primaryDark
  },
  logoText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  title: { marginTop: 20, color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 8, color: colors.muted, lineHeight: 21, textAlign: 'center' },
  form: { marginTop: 32, padding: 20, borderRadius: 18, backgroundColor: '#fff' },
  field: { marginTop: 16 },
  error: { marginTop: 14, color: colors.danger, lineHeight: 20, textAlign: 'center' },
  button: { marginTop: 20 },
  register: { marginTop: 22, color: colors.muted, textAlign: 'center' },
  link: { color: colors.primary, fontWeight: '800' }
});
