import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import StateView from '../../components/StateView';
import { api } from '../../services/api';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils';

const transitions = {
  pending: ['processing', 'Xác nhận'],
  paid: ['processing', 'Xử lý đơn'],
  processing: ['shipping', 'Bắt đầu giao'],
  shipping: ['completed', 'Hoàn thành']
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await api.getAllOrders();
      setOrders([...result].sort((a, b) => b.id - a.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(order, status) {
    try {
      const updated = await api.updateOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
    } catch (requestError) {
      Alert.alert('Không cập nhật được', requestError.message);
    }
  }

  if (loading) return <Screen><StateView loading title="Đang tải đơn hàng..." /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
        <Text style={styles.subtitle}>{orders.length} đơn hàng</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!orders.length ? <StateView title="Chưa có đơn hàng" /> : orders.map((order) => {
          const next = transitions[order.status];
          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.header}><Text style={styles.id}>#{order.id} · {order.customerName || 'N/A'}</Text><Text style={styles.status}>{order.status}</Text></View>
              <Text style={styles.line}>{order.customerPhone || 'Chưa có SĐT'}</Text>
              <Text style={styles.line}>{order.shippingAddress || 'Chưa có địa chỉ'}</Text>
              <Text style={styles.date}>{order.date}</Text>
              <View style={styles.footer}>
                <Text style={styles.total}>{formatCurrency(order.totalAmount)}</Text>
                {next ? <PrimaryButton title={next[1]} onPress={() => updateStatus(order, next[0])} style={styles.action} /> : null}
              </View>
              {!['completed', 'cancelled'].includes(order.status) ? (
                <Text onPress={() => updateStatus(order, 'cancelled')} style={styles.cancel}>Hủy đơn hàng</Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 16, paddingBottom: 35 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { marginTop: 4, marginBottom: 17, color: colors.muted },
  error: { marginBottom: 12, color: colors.danger },
  card: { marginBottom: 13, padding: 17, borderRadius: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  id: { flex: 1, color: colors.text, fontWeight: '900' },
  status: { marginLeft: 10, color: colors.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  line: { marginTop: 7, color: colors.text },
  date: { marginTop: 8, color: colors.muted, fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderColor: colors.border },
  total: { color: colors.accent, fontSize: 17, fontWeight: '900' },
  action: { minHeight: 40, paddingHorizontal: 14 },
  cancel: { marginTop: 14, color: colors.danger, fontWeight: '800', textAlign: 'right' }
});
