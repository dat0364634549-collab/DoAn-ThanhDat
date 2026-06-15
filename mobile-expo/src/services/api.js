import { API_BASE_URL } from '../config';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: controller.signal
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Máy chủ trả về lỗi ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  getProducts: () => request('/products'),
  getHotProducts: () => request('/products/hot'),
  createProduct: (product) =>
    request('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (product) =>
    request(`/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  login: (email, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (user) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify({ ...user, role: 'user', isLocked: false })
    }),
  updateUser: (user) =>
    request(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    }),
  getOrders: (userId) => request(`/transactions/user/${userId}`),
  getOrder: (id) => request(`/transactions/${id}`),
  getAllOrders: () => request('/transactions'),
  updateOrderStatus: (id, status) =>
    request(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  createOrder: (order) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(order)
    }),
  createVnPayPayment: (transactionId) =>
    request('/payments/vnpay/create-url', {
      method: 'POST',
      body: JSON.stringify({ transactionId })
    }),
  getUsers: () => request('/users'),
  toggleUserLock: (id, isLocked) =>
    request(`/users/${id}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ isLocked })
    }),
  getRevenueByMonth: (year) => request(`/transactions/statistics/revenue-by-month?year=${year}`),
  getBestSellingProducts: () => request('/transactions/statistics/best-selling-products?limit=5')
};
