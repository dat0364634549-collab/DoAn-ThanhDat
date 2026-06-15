import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import StateView from '../../components/StateView';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors, shadow } from '../../theme';
import { formatCurrency } from '../../utils';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [products, orders, users] = await Promise.all([
        api.getProducts(),
        api.getAllOrders(),
        api.getUsers()
      ]);
      setData({
        products: products.length,
        orders: orders.length,
        users: users.filter((item) => item.role !== 'admin').length,
        revenue: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        pending: orders.filter((order) => order.status === 'pending').length
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Screen><StateView loading title="Đang tải bảng điều khiển..." /></Screen>;
  if (!data) return <Screen><StateView title="Không tải được dữ liệu" message={error} onAction={load} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}>
        <Text style={styles.eyebrow}>THÀNH ĐẠT SHOP ADMIN</Text>
        <Text style={styles.title}>Xin chào, {user.name}</Text>
        <Text style={styles.subtitle}>Tổng quan hoạt động cửa hàng</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.grid}>
          <StatCard label="Sản phẩm" value={data.products} color={colors.primary} />
          <StatCard label="Đơn hàng" value={data.orders} color="#7a5af8" />
          <StatCard label="Khách hàng" value={data.users} color={colors.success} />
          <StatCard label="Chờ xử lý" value={data.pending} color={colors.warning} />
        </View>
        <View style={styles.revenue}>
          <Text style={styles.revenueLabel}>TỔNG DOANH THU</Text>
          <Text style={styles.revenueValue}>{formatCurrency(data.revenue)}</Text>
        </View>
        <PrimaryButton title="Đăng xuất quản trị" variant="outline" onPress={logout} style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  eyebrow: { marginTop: 8, color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  title: { marginTop: 7, color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { marginTop: 5, color: colors.muted },
  error: { marginTop: 12, color: colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginTop: 21 },
  stat: { width: '46.7%', margin: 6, padding: 17, borderRadius: 16, backgroundColor: '#fff', ...shadow },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statValue: { marginTop: 14, color: colors.text, fontSize: 27, fontWeight: '900' },
  statLabel: { marginTop: 3, color: colors.muted, fontWeight: '700' },
  revenue: { marginTop: 15, padding: 22, borderRadius: 18, backgroundColor: colors.primaryDark },
  revenueLabel: { color: '#a9c7ff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  revenueValue: { marginTop: 9, color: '#fff', fontSize: 28, fontWeight: '900' },
  logout: { marginTop: 24 }
});
