import { useEffect, useState } from 'react';
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
import { WebView } from 'react-native-webview';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { colors } from '../theme';
import { discountedPrice, formatCurrency } from '../utils';

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: ''
  });
  const [payment, setPayment] = useState('cod');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const listener = (event) => {
      if (event.data?.type === 'vnpay-result') {
        handleVnPayResult(event.data);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [paymentSession]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function orderPayload() {
    return {
      userId: user.id,
      products: JSON.stringify(
        items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          quantity,
          price: discountedPrice(product)
        }))
      ),
      totalAmount: total,
      status: payment === 'vnpay' ? 'payment_pending' : 'pending',
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      shippingAddress: form.address.trim(),
      paymentMethod: payment,
      note: form.note.trim()
    };
  }

  async function submit() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    const paymentWindow =
      payment === 'vnpay' && Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.open('about:blank', '_blank')
        : null;

    setLoading(true);
    setError('');
    try {
      const order = await api.createOrder(orderPayload());
      if (payment === 'vnpay') {
        try {
          const session = await api.createVnPayPayment(order.id);
          setPaymentSession({ ...session, orderId: order.id });
          if (Platform.OS === 'web') {
            if (paymentWindow) {
              paymentWindow.location.href = session.paymentUrl;
            } else {
              window.location.href = session.paymentUrl;
            }
          }
        } catch (paymentError) {
          paymentWindow?.close();
          setError(paymentError.message);
        }
      } else {
        clearCart();
        setResult({
          success: true,
          title: 'Đặt hàng thành công',
          message: 'Đơn hàng sẽ được thanh toán khi nhận hàng.'
        });
      }
    } catch (requestError) {
      paymentWindow?.close();
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVnPayResult(payload) {
    if (!paymentSession) return;

    setPaymentSession(null);
    try {
      const order = await api.getOrder(payload.transactionId || paymentSession.orderId);
      if (payload.success && order.status === 'paid') {
        clearCart();
        setResult({
          success: true,
          title: 'Thanh toán thành công',
          message: `VNPAY đã xác nhận đơn hàng #${order.id}.`
        });
      } else {
        setResult({
          success: false,
          title: 'Thanh toán chưa hoàn tất',
          message: payload.message || 'Giao dịch đã bị hủy hoặc thất bại.'
        });
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleWebViewMessage(event) {
    try {
      handleVnPayResult(JSON.parse(event.nativeEvent.data));
    } catch {
      setError('Không đọc được kết quả trả về từ VNPAY.');
    }
  }

  async function checkVnPayStatus() {
    if (!paymentSession) return;

    setLoading(true);
    setError('');
    try {
      const order = await api.getOrder(paymentSession.orderId);
      if (order.status === 'paid') {
        await handleVnPayResult({
          success: true,
          transactionId: order.id
        });
      } else if (order.status === 'payment_failed') {
        await handleVnPayResult({
          success: false,
          transactionId: order.id,
          message: 'Giao dich VNPAY da bi huy hoac thanh toan that bai.'
        });
      } else {
        setError('VNPAY chua xac nhan thanh toan. Hay hoan tat giao dich roi kiem tra lai.');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function closeResult() {
    const wasSuccessful = result?.success;
    setResult(null);
    if (wasSuccessful) {
      navigation.navigate('Main', { screen: 'Orders' });
    }
  }

  return (
    <Screen edges={['left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Thông tin nhận hàng</Text>
          <FormField label="Họ và tên *" value={form.name} onChangeText={(v) => update('name', v)} />
          <FormField label="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" style={styles.field} />
          <FormField label="Số điện thoại *" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" style={styles.field} />
          <FormField label="Địa chỉ *" value={form.address} onChangeText={(v) => update('address', v)} multiline style={styles.field} />
          <FormField label="Ghi chú" value={form.note} onChangeText={(v) => update('note', v)} multiline style={styles.field} />

          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <PaymentOption
            active={payment === 'cod'}
            title="Thanh toán khi nhận hàng"
            description="Thanh toán tiền mặt cho nhân viên giao hàng."
            onPress={() => setPayment('cod')}
          />
          <PaymentOption
            active={payment === 'vnpay'}
            title="Thanh toán qua VNPAY"
            description="Thẻ ATM, tài khoản ngân hàng, VNPAY-QR trong môi trường Sandbox."
            onPress={() => setPayment('vnpay')}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.total}>{formatCurrency(total)}</Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            title={payment === 'vnpay' ? 'Thanh toán với VNPAY' : 'Xác nhận đặt hàng'}
            onPress={submit}
            loading={loading}
            disabled={!items.length}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentModal
        session={paymentSession}
        onClose={() => setPaymentSession(null)}
        onMessage={handleWebViewMessage}
        onCheck={checkVnPayStatus}
        checking={loading}
      />
      <ResultModal result={result} onClose={closeResult} />
    </Screen>
  );
}

function PaymentModal({ session, onClose, onMessage, onCheck, checking }) {
  if (!session) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.paymentModal}>
        <View style={styles.paymentHeader}>
          <View>
            <Text style={styles.paymentHeaderTitle}>Cổng thanh toán VNPAY</Text>
            <Text style={styles.paymentHeaderText}>Sandbox · Đơn hàng #{session.orderId}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Đóng</Text>
          </Pressable>
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.webPaymentNotice}>
            <Text style={styles.webPaymentTitle}>VNPAY da mo trong cua so moi</Text>
            <Text style={styles.webPaymentText}>
              Hoan tat thanh toan tai VNPAY, sau do quay lai day va kiem tra trang thai don hang.
            </Text>
            <PrimaryButton
              title="Mo lai trang VNPAY"
              onPress={() => window.open(session.paymentUrl, '_blank')}
              style={styles.webPaymentButton}
            />
            <PrimaryButton
              title="Kiem tra thanh toan"
              onPress={onCheck}
              loading={checking}
              style={styles.webPaymentButton}
            />
          </View>
        ) : (
          <WebView
            source={{ uri: session.paymentUrl }}
            startInLoadingState
            onMessage={onMessage}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
    </Modal>
  );
}

function ResultModal({ result, onClose }) {
  if (!result) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.resultCard}>
          <Text style={[styles.resultTitle, !result.success && styles.resultFailed]}>{result.title}</Text>
          <Text style={styles.resultText}>{result.message}</Text>
          <PrimaryButton title={result.success ? 'Xem đơn hàng' : 'Đóng'} onPress={onClose} style={styles.resultButton} />
        </View>
      </View>
    </Modal>
  );
}

function PaymentOption({ active, title, description, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.payment, active && styles.paymentActive]}>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.paymentText}>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 45
  },
  title: { marginBottom: 24, color: colors.text, fontSize: 27, fontWeight: '900' },
  field: { marginTop: 16 },
  sectionTitle: { marginTop: 29, marginBottom: 12, color: colors.text, fontSize: 19, fontWeight: '900' },
  payment: { flexDirection: 'row', alignItems: 'center', marginBottom: 11, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: '#fff' },
  paymentActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  radio: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderRadius: 11 },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  paymentText: { flex: 1, marginLeft: 12 },
  paymentTitle: { color: colors.text, fontWeight: '800' },
  paymentDescription: { marginTop: 3, color: colors.muted, fontSize: 12, lineHeight: 17 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: colors.border },
  totalLabel: { color: colors.text, fontSize: 17, fontWeight: '800' },
  total: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  error: { marginTop: 18, color: colors.danger, lineHeight: 20, textAlign: 'center' },
  button: { marginTop: 20 },
  paymentModal: { flex: 1, backgroundColor: '#fff' },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: Platform.OS === 'ios' ? 55 : 15, borderBottomWidth: 1, borderColor: colors.border },
  paymentHeaderTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  paymentHeaderText: { marginTop: 3, color: colors.muted, fontSize: 12 },
  closeButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#eef2f7' },
  closeText: { color: colors.text, fontWeight: '800' },
  webPaymentNotice: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  webPaymentTitle: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  webPaymentText: { maxWidth: 420, marginTop: 12, color: colors.muted, lineHeight: 22, textAlign: 'center' },
  webPaymentButton: { width: '100%', maxWidth: 360, marginTop: 18 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  resultCard: { width: '100%', maxWidth: 360, padding: 24, borderRadius: 19, backgroundColor: '#fff' },
  resultTitle: { color: colors.success, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  resultFailed: { color: colors.danger },
  resultText: { marginTop: 11, color: colors.muted, lineHeight: 21, textAlign: 'center' },
  resultButton: { marginTop: 22 }
});
