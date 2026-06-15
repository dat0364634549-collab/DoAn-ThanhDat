import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import StateView from '../../components/StateView';
import { resolveImageUrl } from '../../config';
import { api } from '../../services/api';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: '',
  discount: '',
  isHot: false,
  totalSold: 0
};

export default function AdminProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setModalVisible(true);
  }

  function openEdit(product) {
    setForm({
      ...product,
      price: String(product.price),
      stock: String(product.stock),
      discount: String(product.discount || '')
    });
    setModalVisible(true);
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!form.name.trim() || !form.category.trim() || Number(form.price) <= 0) {
      Alert.alert('Thiếu thông tin', 'Tên, danh mục và giá hợp lệ là bắt buộc.');
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      discount: form.discount ? Number(form.discount) : null,
      totalSold: Number(form.totalSold || 0)
    };
    setSaving(true);
    try {
      if (payload.id) await api.updateProduct(payload);
      else await api.createProduct(payload);
      setModalVisible(false);
      await load();
    } catch (requestError) {
      Alert.alert('Không lưu được', requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function remove(product) {
    Alert.alert('Xóa sản phẩm', `Xóa "${product.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteProduct(product.id);
            setProducts((current) => current.filter((item) => item.id !== product.id));
          } catch (requestError) {
            Alert.alert('Không xóa được', requestError.message);
          }
        }
      }
    ]);
  }

  if (loading) return <Screen><StateView loading title="Đang tải sản phẩm..." /></Screen>;

  return (
    <Screen>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}><View><Text style={styles.title}>Quản lý sản phẩm</Text><Text style={styles.subtitle}>{products.length} sản phẩm</Text></View><PrimaryButton title="+ Thêm" onPress={openCreate} style={styles.add} /></View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={<StateView title="Chưa có sản phẩm" actionLabel="Thêm sản phẩm" onAction={openCreate} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: resolveImageUrl(item.image) }} resizeMode="contain" style={styles.image} />
            <View style={styles.info}>
              <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category} · Kho {item.stock}</Text>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(item)}><Text style={styles.edit}>Sửa</Text></Pressable>
                <Pressable onPress={() => remove(item)}><Text style={styles.delete}>Xóa</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <ProductModal visible={modalVisible} form={form} update={update} onClose={() => setModalVisible(false)} onSave={save} saving={saving} />
    </Screen>
  );
}

function ProductModal({ visible, form, update, onClose, onSave, saving }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen>
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{form.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
          <FormField label="Tên sản phẩm *" value={form.name} onChangeText={(v) => update('name', v)} />
          <FormField label="Mô tả" value={form.description} onChangeText={(v) => update('description', v)} multiline style={styles.field} />
          <FormField label="Giá *" value={form.price} onChangeText={(v) => update('price', v)} keyboardType="numeric" style={styles.field} />
          <FormField label="Danh mục *" value={form.category} onChangeText={(v) => update('category', v)} style={styles.field} />
          <FormField label="Đường dẫn ảnh" value={form.image} onChangeText={(v) => update('image', v)} autoCapitalize="none" style={styles.field} />
          <FormField label="Tồn kho" value={form.stock} onChangeText={(v) => update('stock', v)} keyboardType="numeric" style={styles.field} />
          <FormField label="Giảm giá (%)" value={form.discount} onChangeText={(v) => update('discount', v)} keyboardType="numeric" style={styles.field} />
          <Pressable onPress={() => update('isHot', !form.isHot)} style={[styles.hot, form.isHot && styles.hotActive]}>
            <Text style={[styles.hotText, form.isHot && styles.hotTextActive]}>{form.isHot ? '✓ Sản phẩm nổi bật' : 'Đánh dấu nổi bật'}</Text>
          </Pressable>
          <PrimaryButton title="Lưu sản phẩm" onPress={onSave} loading={saving} style={styles.save} />
          <PrimaryButton title="Hủy" onPress={onClose} variant="outline" style={styles.cancel} />
        </ScrollView>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { marginTop: 4, color: colors.muted },
  add: { minHeight: 43, paddingHorizontal: 16 },
  error: { marginBottom: 12, color: colors.danger },
  card: { flexDirection: 'row', marginBottom: 12, padding: 12, borderRadius: 15, backgroundColor: '#fff' },
  image: { width: 90, height: 100, borderRadius: 10, backgroundColor: '#f8fafc' },
  info: { flex: 1, paddingLeft: 13 },
  name: { color: colors.text, fontSize: 15, fontWeight: '900' },
  meta: { marginTop: 5, color: colors.muted, fontSize: 12 },
  price: { marginTop: 7, color: colors.accent, fontWeight: '900' },
  actions: { flexDirection: 'row', marginTop: 'auto' },
  edit: { marginRight: 25, color: colors.primary, fontWeight: '900' },
  delete: { color: colors.danger, fontWeight: '900' },
  modalContent: { padding: 20, paddingBottom: 45 },
  modalTitle: { marginBottom: 24, color: colors.text, fontSize: 28, fontWeight: '900' },
  field: { marginTop: 15 },
  hot: { alignItems: 'center', marginTop: 18, padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: '#fff' },
  hotActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  hotText: { color: colors.muted, fontWeight: '800' },
  hotTextActive: { color: colors.primary },
  save: { marginTop: 22 },
  cancel: { marginTop: 10 }
});
