const PUBLIC_SITE_ORIGIN = 'https://thanhdatshop-api.onrender.com';
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const currentHost = window.location.hostname || 'localhost';
const currentOrigin = window.location.origin;
const isCloudflareTunnel = currentHost.includes('trycloudflare.com');
const isLocalBackendPage = LOCAL_HOSTS.includes(currentHost) && window.location.port === '3900';

const API_BASE_URL = isCloudflareTunnel || isLocalBackendPage
    ? `${currentOrigin}/api`
    : `${PUBLIC_SITE_ORIGIN}/api`;
const API_ORIGIN = new URL(API_BASE_URL).origin;
const API_TIMEOUT_MS = 90000;

const FALLBACK_PRODUCTS = [
    {
        id: 1,
        name: 'Áo Thun',
        description: 'Áo thun nam basic thiết kế vui nhộn',
        price: 150000,
        category: 'ao-thun',
        image: 'images/mlb1.jpg',
        isHot: true,
        discount: 10,
        stock: 10
    },
    {
        id: 2,
        name: 'Áo Thun Form Boxy Nam Nữ Unisex Local Brand',
        description: 'Áo form rộng, chất vải thoáng mát, dễ phối đồ',
        price: 150000,
        category: 'ao-thun',
        image: 'images/mlb3.jpg',
        isHot: true,
        discount: 0,
        stock: 20
    },
    {
        id: 3,
        name: 'Áo thun FIDE TEDDY phông unisex form rộng',
        description: 'Áo thun local brand phong cách trẻ trung',
        price: 249000,
        category: 'ao-thun',
        image: 'images/mlb4.jpg',
        isHot: true,
        discount: 0,
        stock: 18
    },
    {
        id: 4,
        name: 'Áo Thun Nam Nữ Local Brand Frozen Essentials',
        description: 'Áo thun nam nữ màu navy, form basic dễ mặc',
        price: 199000,
        category: 'ao-thun',
        image: 'images/mlb5.jpg',
        isHot: true,
        discount: 0,
        stock: 14
    },
    {
        id: 5,
        name: 'Áo Thun Nam Nữ Cổ Tròn Tay Lỡ Popop Mascot',
        description: 'Áo phông local brand in hình nổi bật',
        price: 249000,
        category: 'ao-thun',
        image: 'images/mlb6.jpg',
        isHot: true,
        discount: 0,
        stock: 12
    },
    {
        id: 6,
        name: 'Quần Thun',
        description: 'Quần thun nam nữ basic, thoải mái hằng ngày',
        price: 200000,
        category: 'quan-thun',
        image: 'images/mlb7.jpg',
        isHot: false,
        discount: 0,
        stock: 16
    },
    {
        id: 7,
        name: 'Áo Khoác',
        description: 'Áo khoác nhẹ, phong cách năng động',
        price: 299000,
        category: 'ao-khoac',
        image: 'images/mlb11.jpg',
        isHot: false,
        discount: 0,
        stock: 8
    },
    {
        id: 8,
        name: 'Váy',
        description: 'Váy nữ thanh lịch, chất liệu mềm nhẹ',
        price: 260000,
        category: 'vay',
        image: 'images/mlb2.jpg',
        isHot: false,
        discount: 0,
        stock: 9
    }
];

const FALLBACK_USERS = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'Matkhau@1',
        phone: '0348588823',
        address: 'TP.HCM',
        registeredDate: '2026-05-30',
        role: 'admin',
        isLocked: false
    },
    {
        id: 2,
        name: 'Nguyễn Văn A',
        email: 'user1@gmail.com',
        password: 'Matkhau@1',
        phone: '0912345678',
        address: '45 Lê Lợi, Quận 1, TP.HCM',
        registeredDate: '2026-05-01',
        role: 'user',
        isLocked: false
    }
];

function resolveImageUrl(imagePath) {
    const value = String(imagePath || '').trim();
    if (!value || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (/^\/?uploads\//i.test(value)) {
        return `${API_ORIGIN}/${value.replace(/^\/+/, '')}`;
    }

    return value;
}

function normalizeProduct(product) {
    if (!product || typeof product !== 'object') {
        return product;
    }

    return {
        ...product,
        image: resolveImageUrl(product.image),
        images: Array.isArray(product.images)
            ? product.images.map(resolveImageUrl)
            : product.images
    };
}

function normalizeProductsResponse(data) {
    return Array.isArray(data) ? data.map(normalizeProduct) : normalizeProduct(data);
}

async function requestJson(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            ...options,
            cache: 'no-store',
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchJson(url, fallbackValue, transform) {
    try {
        const data = await requestJson(url);
        return transform ? transform(data) : data;
    } catch (error) {
        const canUseFallback = isCloudflareTunnel || isLocalBackendPage;
        if (canUseFallback && fallbackValue !== undefined) {
            console.warn('API local fallback:', error);
            const data = typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
            return transform ? transform(data) : data;
        }

        console.error('Không thể kết nối API production:', error);
        throw new Error('Máy chủ dữ liệu đang không hoạt động. Vui lòng thử lại sau.');
    }
}

async function fetchJsonWithBody(url, options, fallbackValue, transform) {
    try {
        const data = await requestJson(url, options);
        return transform ? transform(data) : data;
    } catch (error) {
        const canUseFallback = isCloudflareTunnel || isLocalBackendPage;
        if (canUseFallback && fallbackValue !== undefined) {
            console.warn('API local fallback:', error);
            const data = typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
            return transform ? transform(data) : data;
        }

        console.error('Không thể kết nối API production:', error);
        throw new Error('Máy chủ dữ liệu đang không hoạt động. Vui lòng thử lại sau.');
    }
}

function findFallbackProduct(id) {
    return FALLBACK_PRODUCTS.find(product => String(product.id) === String(id)) || FALLBACK_PRODUCTS[0];
}

function filterFallbackByCategory(category) {
    return FALLBACK_PRODUCTS.filter(product => product.category === category);
}

function searchFallbackProducts(query) {
    const keyword = String(query || '').toLowerCase();
    return FALLBACK_PRODUCTS.filter(product =>
        `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(keyword)
    );
}

const API = {
    products: {
        async getAll() {
            return await fetchJson(`${API_BASE_URL}/products`, FALLBACK_PRODUCTS, normalizeProductsResponse);
        },

        async getById(id) {
            return await fetchJson(`${API_BASE_URL}/products/${id}`, findFallbackProduct(id), normalizeProductsResponse);
        },

        async getByCategory(category) {
            return await fetchJson(`${API_BASE_URL}/products/category/${category}`, filterFallbackByCategory(category), normalizeProductsResponse);
        },

        async getHot() {
            return await fetchJson(`${API_BASE_URL}/products/hot`, FALLBACK_PRODUCTS.filter(product => product.isHot), normalizeProductsResponse);
        },

        async search(query) {
            return await fetchJson(`${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`, searchFallbackProducts(query), normalizeProductsResponse);
        },

        async create(productData) {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            return await response.json();
        },

        async update(id, productData) {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            return await response.json();
        },

        async delete(id) {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        }
    },

    users: {
        async getAll() {
            return await fetchJson(`${API_BASE_URL}/users`, FALLBACK_USERS.map(({ password, ...user }) => user));
        },

        async getById(id) {
            const fallbackUser = FALLBACK_USERS.find(user => String(user.id) === String(id)) || null;
            if (fallbackUser) {
                const { password, ...safeUser } = fallbackUser;
                return await fetchJson(`${API_BASE_URL}/users/${id}`, safeUser);
            }
            return await fetchJson(`${API_BASE_URL}/users/${id}`, null);
        },

        async create(userData) {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        },

        async login(email, password) {
            return await fetchJsonWithBody(
                `${API_BASE_URL}/users/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                },
                () => {
                    const fallbackUser = FALLBACK_USERS.find(user =>
                        user.email.toLowerCase() === String(email).toLowerCase() &&
                        user.password === password &&
                        !user.isLocked
                    );

                    if (!fallbackUser) {
                        return { message: 'Email hoặc mật khẩu không chính xác!' };
                    }

                    const { password: _password, ...safeUser } = fallbackUser;
                    return safeUser;
                }
            );
        },

        async update(id, userData) {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        },

        async delete(id) {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        }
    },

    transactions: {
        async getAll() {
            const response = await fetch(`${API_BASE_URL}/transactions`);
            return await response.json();
        },

        async getById(id) {
            const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
            return await response.json();
        },

        async getByUser(userId) {
            const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`);
            return await response.json();
        },

        async create(transactionData) {
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });
            return await response.json();
        },

        async updateStatus(id, status) {
            const response = await fetch(`${API_BASE_URL}/transactions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            return await response.json();
        },

        async getRevenue() {
            const response = await fetch(`${API_BASE_URL}/transactions/revenue`);
            return await response.json();
        },

        async getRecent(limit = 5) {
            const response = await fetch(`${API_BASE_URL}/transactions/recent?limit=${limit}`);
            return await response.json();
        },

        async getRevenueByDate(startDate, endDate) {
            const response = await fetch(`${API_BASE_URL}/transactions/statistics/revenue-by-date?startDate=${startDate}&endDate=${endDate}`);
            return await response.json();
        },

        async getRevenueByMonth(year) {
            const response = await fetch(`${API_BASE_URL}/transactions/statistics/revenue-by-month?year=${year}`);
            return await response.json();
        },

        async getBestSellingProducts(limit = 10) {
            const response = await fetch(`${API_BASE_URL}/transactions/statistics/best-selling-products?limit=${limit}`);
            return await response.json();
        }
    },

    contact: {
        async get() {
            const response = await fetch(`${API_BASE_URL}/contact`);
            return await response.json();
        },

        async update(contactData) {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            return await response.json();
        }
    }
};

function handleError(error) {
    console.error('API Error:', error);
    throw error;
}

async function apiCall(apiFunction) {
    try {
        return await apiFunction();
    } catch (error) {
        handleError(error);
    }
}
