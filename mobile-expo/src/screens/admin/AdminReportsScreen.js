import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import StateView from '../../components/StateView';
import { api } from '../../services/api';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils';

export default function AdminReportsScreen() {
  const [months, setMonths] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const year = new Date().getFullYear();

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [monthData, productData] = await Promise.all([
        api.getRevenueByMonth(year),
        api.getBestSellingProducts()
      ]);
      setMonths(monthData);
      setBestSelling(productData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const maxRevenue = useMemo(() => Math.max(...months.map((item) => Number(item.revenue)), 1), [months]);
  const total = months.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

  if (loading) return <Screen><StateView loading title="Đang lập báo cáo..." /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}>
        <Text style={styles.title}>Báo cáo thống kê</Text>
        <Text style={styles.subtitle}>Dữ liệu doanh thu năm {year}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.totalCard}><Text style={styles.totalLabel}>TỔNG DOANH THU {year}</Text><Text style={styles.total}>{formatCurrency(total)}</Text></View>
        <Text style={styles.section}>Doanh thu theo tháng</Text>
        <View style={styles.chart}>
          {!months.length ? <Text style={styles.empty}>Chưa có dữ liệu trong năm nay.</Text> : months.map((item) => (
            <View key={item.month} style={styles.barRow}>
              <Text style={styles.month}>{item.month}</Text>
              <View style={styles.track}><View style={[styles.bar, { width: `${Math.max(5, Number(item.revenue) / maxRevenue * 100)}%` }]} /></View>
              <Text style={styles.barValue}>{formatCurrency(item.revenue)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.section}>Sản phẩm bán chạy</Text>
        <View style={styles.list}>
          {!bestSelling.length ? <Text style={styles.empty}>Chưa có sản phẩm phát sinh doanh số.</Text> : bestSelling.map((item, index) => (
            <View key={item.productId} style={styles.product}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.productInfo}><Text style={styles.productName}>{item.productName}</Text><Text style={styles.productMeta}>Đã bán {item.totalQuantity}</Text></View>
              <Text style={styles.productRevenue}>{formatCurrency(item.totalRevenue)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { marginTop: 4, color: colors.muted },
  error: { marginTop: 12, color: colors.danger },
  totalCard: { marginTop: 20, padding: 22, borderRadius: 18, backgroundColor: colors.primaryDark },
  totalLabel: { color: '#a9c7ff', fontSize: 12, fontWeight: '900' },
  total: { marginTop: 8, color: '#fff', fontSize: 28, fontWeight: '900' },
  section: { marginTop: 25, marginBottom: 11, color: colors.text, fontSize: 18, fontWeight: '900' },
  chart: { padding: 16, borderRadius: 16, backgroundColor: '#fff' },
  barRow: { marginBottom: 15 },
  month: { color: colors.text, fontSize: 12, fontWeight: '800' },
  track: { height: 10, marginTop: 6, overflow: 'hidden', borderRadius: 5, backgroundColor: '#e8edf5' },
  bar: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
  barValue: { marginTop: 5, color: colors.muted, fontSize: 11, textAlign: 'right' },
  list: { padding: 14, borderRadius: 16, backgroundColor: '#fff' },
  product: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderColor: colors.border },
  rank: { width: 30, color: colors.primary, fontSize: 18, fontWeight: '900' },
  productInfo: { flex: 1 },
  productName: { color: colors.text, fontWeight: '800' },
  productMeta: { marginTop: 3, color: colors.muted, fontSize: 12 },
  productRevenue: { marginLeft: 10, color: colors.accent, fontSize: 12, fontWeight: '900' },
  empty: { paddingVertical: 18, color: colors.muted, textAlign: 'center' }
});
