import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ContactScreen from '../screens/ContactScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: '⌂',
  Products: '▦',
  Cart: '▣',
  Orders: '≡',
  Profile: '●',
  AdminDashboard: '⌂',
  AdminProducts: '▦',
  AdminOrders: '≡',
  AdminUsers: '●',
  AdminReports: '▤'
};

function MainTabs() {
  const { count } = useCart();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7b8495',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{tabIcons[route.name]}</Text>
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Sản phẩm' }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Giỏ hàng', tabBarBadge: count || undefined, tabBarBadgeStyle: styles.badge }}
      />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Đơn hàng' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7b8495',
        tabBarLabelStyle: styles.adminTabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{tabIcons[route.name]}</Text>
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Tổng quan' }} />
      <Tab.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Sản phẩm' }} />
      <Tab.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Đơn hàng' }} />
      <Tab.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Khách hàng' }} />
      <Tab.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Báo cáo' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang khởi động...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      {user ? (
        user.role === 'admin' ? (
          <Stack.Screen name="AdminMain" component={AdminTabs} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
            <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Liên hệ' }} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.muted },
  tabBar: { height: 67, paddingTop: 6, paddingBottom: 8, borderTopColor: colors.border },
  tabLabel: { fontSize: 11, fontWeight: '700' },
  adminTabLabel: { fontSize: 9, fontWeight: '700' },
  tabIcon: { fontSize: 23, fontWeight: '900' },
  badge: { backgroundColor: colors.accent }
});
