import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import StateView from '../../components/StateView';
import { api } from '../../services/api';
import { colors } from '../../theme';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setUsers((await api.getUsers()).filter((user) => user.role !== 'admin'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(user) {
    try {
      const updated = await api.toggleUserLock(user.id, !user.isLocked);
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item));
    } catch (requestError) {
      Alert.alert('Không cập nhật được', requestError.message);
    }
  }

  if (loading) return <Screen><StateView loading title="Đang tải khách hàng..." /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}>
        <Text style={styles.title}>Quản lý khách hàng</Text>
        <Text style={styles.subtitle}>{users.length} tài khoản khách hàng</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!users.length ? <StateView title="Chưa có khách hàng" /> : users.map((user) => (
          <View key={user.id} style={styles.card}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.meta}>{user.phone || 'Chưa có SĐT'} · {user.registeredDate}</Text>
            </View>
            <PrimaryButton
              title={user.isLocked ? 'Mở khóa' : 'Khóa'}
              variant={user.isLocked ? 'primary' : 'outline'}
              onPress={() => toggle(user)}
              style={styles.action}
            />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 16, paddingBottom: 35 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { marginTop: 4, marginBottom: 17, color: colors.muted },
  error: { marginBottom: 12, color: colors.danger },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 14, borderRadius: 15, backgroundColor: '#fff' },
  avatar: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: '#e7efff' },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  info: { flex: 1, marginHorizontal: 12 },
  name: { color: colors.text, fontWeight: '900' },
  email: { marginTop: 3, color: colors.muted, fontSize: 12 },
  meta: { marginTop: 4, color: colors.muted, fontSize: 11 },
  action: { minHeight: 40, paddingHorizontal: 12 }
});
