import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import StateView from '../components/StateView';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors, shadow } from '../theme';
import { formatCurrency, parseOrderProducts } from '../utils';

const statusMap = {
  pending: ['Chờ xác nhận', colors.warning],
  paid: ['Đã thanh toán', colors.primary],
  payment_pending: ['Chờ thanh toán VNPAY', colors.warning],
  payment_failed: ['Thanh toán thất bại', colors.danger],
  processing: ['Đang xử lý', colors.primary],
  shipping: ['Đang giao', '#7a5af8'],
  completed: ['Hoàn thành', colors.success],
  cancelled: ['Đã hủy', colors.danger]
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await api.getOrders(user.id);
      setOrders([...result].sort((a, b) => b.id - a.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Screen><StateView loading title="Đang tải đơn hàng..." /></Screen>;
  if (error && !orders.length) return <Screen><StateView title="Không tải được đơn hàng" message={error} onAction={load} /></Screen>;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
      >
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!orders.length ? (
          <StateView title="Bạn chưa có đơn hàng" message="Các đơn đã đặt sẽ xuất hiện tại đây." />
        ) : orders.map((order) => {
          const products = parseOrderProducts(order.products);
          const [statusLabel, statusColor] = statusMap[order.status?.toLowerCase()] || [order.status || 'Không rõ', colors.muted];
          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View><Text style={styles.orderId}>Đơn hàng #{order.id}</Text><Text style={styles.date}>{order.date}</Text></View>
                <Text style={[styles.status, { color: statusColor, backgroundColor: `${statusColor}15` }]}>{statusLabel}</Text>
              </View>
              <View style={styles.divider} />
              {products.map((product, index) => (
                <View key={`${product.productId}-${index}`} style={styles.productRow}>
                  <Text numberOfLines={1} style={styles.productName}>{product.productName}</Text>
                  <Text style={styles.productQuantity}>x{product.quantity}</Text>
                </View>
              ))}
              <View style={styles.totalRow}><Text style={styles.payment}>{order.paymentMethod === 'vnpay' ? 'Thanh toán VNPAY' : 'Thanh toán khi nhận'}</Text><Text style={styles.total}>{formatCurrency(order.totalAmount)}</Text></View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 16, paddingBottom: 35 },
  title: { marginBottom: 17, color: colors.text, fontSize: 29, fontWeight: '900' },
  error: { marginBottom: 12, color: colors.danger },
  card: { marginBottom: 14, padding: 17, borderRadius: 17, backgroundColor: '#fff', ...shadow },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { color: colors.text, fontSize: 16, fontWeight: '900' },
  date: { marginTop: 4, color: colors.muted, fontSize: 12 },
  status: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, overflow: 'hidden', fontSize: 12, fontWeight: '900' },
  divider: { height: 1, marginVertical: 14, backgroundColor: colors.border },
  productRow: { flexDirection: 'row', marginBottom: 7 },
  productName: { flex: 1, color: colors.text },
  productQuantity: { marginLeft: 12, color: colors.muted, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 13, borderTopWidth: 1, borderColor: colors.border },
  payment: { color: colors.muted, fontSize: 12 },
  total: { color: colors.accent, fontSize: 17, fontWeight: '900' }
});
