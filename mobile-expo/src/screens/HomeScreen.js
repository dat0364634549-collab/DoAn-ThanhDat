import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import ProductCard from '../components/ProductCard';
import Screen from '../components/Screen';
import StateView from '../components/StateView';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { colors } from '../theme';

const logoUrl = 'https://thanhdatshop.netlify.app/images/logo.png';
const bannerUrl = 'https://thanhdatshop.netlify.app/images/banner-thanhdat-shop.jpg';

export default function HomeScreen({ navigation }) {
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setProducts(await api.getHotProducts());
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

  function search() {
    navigation.navigate('Products', { query: query.trim() });
  }

  if (loading) {
    return <Screen><StateView loading title="Đang chuẩn bị cửa hàng..." /></Screen>;
  }

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.oldHeader}>
              <Image source={{ uri: logoUrl }} resizeMode="contain" style={styles.logo} />

              <View style={styles.menu}>
                <Pressable onPress={() => navigation.navigate('Home')} style={styles.menuItem}>
                  <Text style={styles.menuText}>Trang chủ</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Products')} style={styles.menuItem}>
                  <Text style={styles.menuText}>Sản phẩm</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => navigation.getParent()?.navigate('Contact')}
                >
                  <Text style={styles.menuText}>Liên hệ</Text>
                </Pressable>
              </View>

              <View style={styles.searchRow}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={search}
                  returnKeyType="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  placeholderTextColor="#a8a8ad"
                  style={styles.searchInput}
                />
                <Pressable onPress={search} style={styles.searchButton}>
                  <Text style={styles.searchIcon}>⌕</Text>
                </Pressable>
              </View>

              <View style={styles.headerActions}>
                <Pressable onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
                  <Text style={styles.cartIcon}>▣</Text>
                  {count > 0 ? <Text style={styles.cartBadge}>{count}</Text> : null}
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
                  <Text style={styles.profileIcon}>●</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Sản Phẩm Hot</Text>
            <Image source={{ uri: bannerUrl }} resizeMode="cover" style={styles.banner} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          <StateView
            title="Chưa có sản phẩm nổi bật"
            message="Kéo xuống để tải lại dữ liệu."
          />
        }
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
  screen: {
    overflow: 'hidden'
  },
  flatList: {
    width: '100%'
  },
  list: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingBottom: 32
  },
  productRow: {
    width: '100%'
  },
  oldHeader: {
    width: 'auto',
    marginHorizontal: 0,
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#37383b',
    borderRadius: 10,
    backgroundColor: '#19191b'
  },
  logo: {
    width: 116,
    height: 55,
    borderRadius: 6,
    backgroundColor: '#fff'
  },
  menu: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%'
  },
  menuItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: 6
  },
  menuText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#55565b',
    borderRadius: 28,
    backgroundColor: '#29292c'
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 51,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16
  },
  searchButton: {
    flexShrink: 0,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#ef4b3b'
  },
  searchIcon: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 13,
    paddingRight: 1
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 24,
    backgroundColor: '#27272a'
  },
  profileButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#ef4b3b'
  },
  cartIcon: {
    color: '#fff',
    fontSize: 25
  },
  profileIcon: {
    color: '#fff',
    fontSize: 24
  },
  cartBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ef4b3b',
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center'
  },
  sectionTitle: {
    marginHorizontal: 0,
    marginTop: 28,
    marginBottom: 18,
    color: '#08090b',
    fontSize: 31,
    fontWeight: '900'
  },
  banner: {
    width: '100%',
    aspectRatio: 1.55,
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  error: {
    marginHorizontal: 14,
    marginBottom: 10,
    color: colors.danger
  }
});
