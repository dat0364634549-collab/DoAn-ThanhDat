const ADMIN_PUBLIC_SITE_ORIGIN = 'https://thanhdatshop-api.onrender.com';
const ADMIN_LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const ADMIN_HOST = window.location.hostname || 'localhost';
const ADMIN_ORIGIN = window.location.origin;
const API_URL = (ADMIN_HOST.includes('trycloudflare.com') || (ADMIN_LOCAL_HOSTS.includes(ADMIN_HOST) && window.location.port === '3900'))
    ? `${ADMIN_ORIGIN}/api`
    : `${ADMIN_PUBLIC_SITE_ORIGIN}/api`;

let currentUser = null;

function checkAdminAuth() {
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminUser) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(adminUser);
        if (currentUser.role !== 'admin') {
            localStorage.removeItem('adminUser');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    } catch (error) {
        localStorage.removeItem('adminUser');
        window.location.href = 'admin-login.html';
        return false;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

async function loadDashboard() {
    try {
        const [revenueRes, ordersRes, productsRes, usersRes, recentOrdersRes] = await Promise.all([
            fetch(`${API_URL}/transactions/revenue`),
            fetch(`${API_URL}/transactions`),
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/transactions/recent?limit=5`)
        ]);

        const totalRevenue = await revenueRes.json();
        const orders = await ordersRes.json();
        const products = await productsRes.json();
        const users = await usersRes.json();
        const recentOrders = await recentOrdersRes.json();

        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalCustomers').textContent = users.filter(u => u.role === 'user').length;

        const recentOrdersTable = document.getElementById('recentOrdersTable');
        if (recentOrders.length === 0) {
            recentOrdersTable.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có đơn hàng nào</td></tr>';
        } else {
            const userMap = {};
            users.forEach(user => {
                userMap[user.id] = user.name;
            });

            recentOrdersTable.innerHTML = recentOrders.map(order => {
                const statusBadge = getStatusBadge(order.status);
                return `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${userMap[order.userId] || 'N/A'}</td>
                        <td>${formatCurrency(order.totalAmount)}</td>
                        <td>${order.date}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function getStatusBadge(status) {
    const statusMap = {
        'pending': { text: 'Đang chờ', class: 'warning' },
        'processing': { text: 'Đang xử lý', class: 'info' },
        'completed': { text: 'Hoàn thành', class: 'success' },
        'cancelled': { text: 'Đã hủy', class: 'danger' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'secondary' };
    return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

function setupNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const sectionId = link.getAttribute('data-section');
            
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
                
                const titles = {
                    'dashboard': 'Dashboard',
                    'products': 'Quản lý sản phẩm',
                    'orders': 'Quản lý đơn hàng',
                    'users': 'Quản lý khách hàng',
                    'reports': 'Báo cáo thống kê'
                };
                document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
                
                if (sectionId === 'dashboard') {
                    loadDashboard();
                } else if (sectionId === 'products' && window.loadProducts) {
                    window.loadProducts();
                } else if (sectionId === 'orders' && window.loadOrders) {
                    window.loadOrders();
                } else if (sectionId === 'users' && window.loadUsers) {
                    window.loadUsers();
                } else if (sectionId === 'reports' && window.loadReports) {
                    window.loadReports();
                }
            }
        });
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('adminUser');
            window.location.href = 'index.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) {
        return;
    }
    
    document.getElementById('adminName').textContent = `Xin chào, ${currentUser.name}`;
    
    setupNavigation();
    setupLogout();
    loadDashboard();
});
