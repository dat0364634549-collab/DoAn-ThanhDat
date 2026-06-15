import { useRef } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { resolveImageUrl } from '../config';
import { useCart } from '../context/CartContext';
import { colors } from '../theme';
import { discountedPrice, formatCurrency } from '../utils';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const { addItem } = useCart();
  const scale = useRef(new Animated.Value(1)).current;
  const finalPrice = discountedPrice(product);

  function add() {
    addItem(product);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true })
    ]).start();
  }

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}>
          {product.image ? <Image source={{ uri: resolveImageUrl(product.image) }} resizeMode="contain" style={styles.image} /> : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.category}>{product.category || 'THỜI TRANG'}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(finalPrice)}</Text>
            {finalPrice !== Number(product.price) ? <Text style={styles.oldPrice}>{formatCurrency(product.price)}</Text> : null}
          </View>
          <View style={styles.stockRow}>
            <Text style={[styles.stock, product.stock <= 0 && styles.outOfStock]}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Đã hết hàng'}
            </Text>
            <Text style={styles.sold}>Đã bán {product.totalSold || 0}</Text>
          </View>
          <Text style={styles.heading}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description || 'Sản phẩm thời trang Thành Đạt Shop.'}</Text>
          <Animated.View style={{ transform: [{ scale }] }}>
            <PrimaryButton title="Thêm vào giỏ hàng" onPress={add} disabled={product.stock <= 0} style={styles.button} />
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 35 },
  imageWrap: { height: 390, margin: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#fff' },
  image: { width: '94%', height: '94%' },
  body: { paddingHorizontal: 20 },
  category: { color: colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  name: { marginTop: 8, color: colors.text, fontSize: 27, fontWeight: '900', lineHeight: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  price: { color: colors.accent, fontSize: 25, fontWeight: '900' },
  oldPrice: { marginLeft: 12, color: colors.muted, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  stock: { color: colors.success, fontWeight: '800' },
  outOfStock: { color: colors.danger },
  sold: { color: colors.muted },
  heading: { marginTop: 24, color: colors.text, fontSize: 18, fontWeight: '900' },
  description: { marginTop: 10, color: colors.muted, fontSize: 15, lineHeight: 24 },
  button: { marginTop: 28 }
});
