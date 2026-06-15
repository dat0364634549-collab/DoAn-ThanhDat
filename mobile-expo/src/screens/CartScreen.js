import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import StateView from '../components/StateView';
import { resolveImageUrl } from '../config';
import { useCart } from '../context/CartContext';
import { colors, shadow } from '../theme';
import { discountedPrice, formatCurrency } from '../utils';

export default function CartScreen({ navigation }) {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <Screen>
        <StateView
          title="Giỏ hàng đang trống"
          message="Hãy chọn một vài sản phẩm bạn yêu thích."
          actionLabel="Xem sản phẩm"
          onAction={() => navigation.navigate('Products')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Giỏ hàng</Text>
        {items.map(({ product, quantity }) => (
          <View key={product.id} style={styles.item}>
            <Image source={{ uri: resolveImageUrl(product.image) }} resizeMode="contain" style={styles.image} />
            <View style={styles.info}>
              <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>{formatCurrency(discountedPrice(product))}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => updateQuantity(product.id, quantity - 1)} style={styles.quantityButton}><Text style={styles.quantityText}>-</Text></Pressable>
                <Text style={styles.quantity}>{quantity}</Text>
                <Pressable onPress={() => updateQuantity(product.id, quantity + 1)} style={styles.quantityButton}><Text style={styles.quantityText}>+</Text></Pressable>
                <Pressable onPress={() => removeItem(product.id)}><Text style={styles.remove}>Xóa</Text></Pressable>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tạm tính</Text><Text style={styles.summaryValue}>{formatCurrency(total)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Phí vận chuyển</Text><Text style={styles.free}>Miễn phí</Text></View>
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Tổng cộng</Text><Text style={styles.total}>{formatCurrency(total)}</Text></View>
          <PrimaryButton title="Tiến hành thanh toán" onPress={() => navigation.navigate('Checkout')} style={styles.checkout} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { marginBottom: 16, color: colors.text, fontSize: 30, fontWeight: '900' },
  item: { flexDirection: 'row', marginBottom: 13, padding: 12, borderRadius: 16, backgroundColor: '#fff', ...shadow },
  image: { width: 100, height: 112, borderRadius: 12, backgroundColor: '#f8fafc' },
  info: { flex: 1, justifyContent: 'space-between', paddingLeft: 13 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  price: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
  quantityText: { color: colors.text, fontSize: 18, fontWeight: '800' },
  quantity: { minWidth: 34, color: colors.text, fontWeight: '800', textAlign: 'center' },
  remove: { marginLeft: 'auto', color: colors.danger, fontWeight: '700' },
  summary: { marginTop: 8, padding: 18, borderRadius: 18, backgroundColor: '#fff' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13 },
  summaryLabel: { color: colors.muted },
  summaryValue: { color: colors.text, fontWeight: '800' },
  free: { color: colors.success, fontWeight: '800' },
  totalRow: { marginTop: 3, paddingTop: 16, borderTopWidth: 1, borderColor: colors.border },
  totalLabel: { color: colors.text, fontSize: 17, fontWeight: '900' },
  total: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  checkout: { marginTop: 8 }
});
