import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '../config';
import { colors, shadow } from '../theme';
import { discountedPrice, formatCurrency } from '../utils';

export default function ProductCard({ product, onPress, onAdd }) {
  const finalPrice = discountedPrice(product);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image source={{ uri: resolveImageUrl(product.image) }} resizeMode="contain" style={styles.image} />
        ) : (
          <Text style={styles.noImage}>Không có ảnh</Text>
        )}
        {product.discount > 0 ? <Text style={styles.badge}>-{product.discount}%</Text> : null}
      </View>
      <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.category || 'Thời trang'}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatCurrency(finalPrice)}</Text>
        {finalPrice !== Number(product.price) ? (
          <Text style={styles.oldPrice}>{formatCurrency(product.price)}</Text>
        ) : null}
      </View>
      <Pressable
        disabled={product.stock <= 0}
        onPress={(event) => {
          event.stopPropagation?.();
          onAdd(product);
        }}
        style={[styles.addButton, product.stock <= 0 && styles.disabled]}
      >
        <Text style={styles.addText}>{product.stock <= 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    margin: 7,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...shadow
  },
  pressed: { opacity: 0.88 },
  imageWrap: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#f8fafc'
  },
  image: { width: '100%', height: '100%' },
  noImage: { color: colors.muted },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.accent,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800'
  },
  name: { minHeight: 42, marginTop: 11, color: colors.text, fontSize: 15, fontWeight: '800' },
  category: { marginTop: 3, color: colors.muted, fontSize: 12 },
  priceRow: { minHeight: 42, marginTop: 8 },
  price: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  oldPrice: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' },
  addButton: {
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  addText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  disabled: { backgroundColor: '#98a2b3' }
});
