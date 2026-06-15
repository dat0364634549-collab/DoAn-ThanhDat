import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ProductCard from '../components/ProductCard';
import Screen from '../components/Screen';
import StateView from '../components/StateView';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { colors } from '../theme';

export default function ProductsScreen({ navigation, route }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(route.params?.category || 'Tất cả');
  const [sort, setSort] = useState('Mặc định');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setProducts(await api.getProducts());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (route.params?.category) setCategory(route.params.category);
  }, [route.params?.category]);

  useEffect(() => {
    if (typeof route.params?.query === 'string') {
      setQuery(route.params.query);
    }
  }, [route.params?.query]);

  const categories = useMemo(
    () => ['Tất cả', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesQuery && (category === 'Tất cả' || product.category === category);
    });
    if (sort === 'Giá tăng') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Giá giảm') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'Tên A-Z') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, query, category, sort]);

  if (loading) return <Screen><StateView loading title="Đang tải sản phẩm..." /></Screen>;
  if (error && !products.length) {
    return <Screen><StateView title="Không tải được sản phẩm" message={error} onAction={load} /></Screen>;
  }

  return (
    <Screen>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Sản phẩm</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm theo tên sản phẩm..."
              placeholderTextColor="#98a2b3"
              style={styles.search}
            />
            <Text style={styles.label}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {categories.map((item) => (
                <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
                  <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Sắp xếp</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {['Mặc định', 'Giá tăng', 'Giá giảm', 'Tên A-Z'].map((item) => (
                <Pressable key={item} onPress={() => setSort(item)} style={[styles.chip, sort === item && styles.chipActive]}>
                  <Text style={[styles.chipText, sort === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.count}>{visibleProducts.length} sản phẩm</Text>
          </View>
        }
        ListEmptyComponent={<StateView title="Không tìm thấy sản phẩm" message="Hãy thử từ khóa hoặc bộ lọc khác." />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onAdd={addItem}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 9, paddingBottom: 30 },
  title: { margin: 14, marginBottom: 12, color: colors.text, fontSize: 30, fontWeight: '900' },
  search: { marginHorizontal: 14, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: '#fff', color: colors.text },
  label: { marginHorizontal: 14, marginTop: 18, color: colors.text, fontWeight: '800' },
  filters: { paddingHorizontal: 14, paddingTop: 9 },
  chip: { marginRight: 8, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: '#fff' },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  count: { margin: 14, color: colors.muted }
});
