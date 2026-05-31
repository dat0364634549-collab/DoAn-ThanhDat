let orders = [];
let users = [];

const statusLabels = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    paid: 'Đã thanh toán',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
};

async function loadOrders() {
    try {
        const [ordersRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/transactions`),
            fetch(`${API_URL}/users`)
        ]);

        orders = await ordersRes.json();
        users = await usersRes.json();
        orders.sort((a, b) => Number(b.id) - Number(a.id));
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><h3>Chưa có đơn hàng nào</h3></td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const products = parseProducts(order.products);
        const productsPreview = products.length > 0
            ? `${products[0].productName}${products.length > 1 ? ` +${products.length - 1}` : ''}`
            : 'N/A';
        const fallbackUser = users.find(user => user.id === order.userId);
        const customerName = order.customerName || fallbackUser?.name || 'Khách lẻ';

        return `
            <tr>
                <td>#${order.id}</td>
                <td>
                    <strong>${customerName}</strong>
                    ${order.customerPhone ? `<br><small>${order.customerPhone}</small>` : ''}
                </td>
                <td>${productsPreview}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td>${order.date}</td>
                <td>
                    <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
                        ${Object.entries(statusLabels).map(([value, label]) =>
                            `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrderDetail(${order.id})">Chi tiết</button>
                </td>
            </tr>
        `;
    }).join('');
}

function parseProducts(productsJson) {
    try {
        return JSON.parse(productsJson || '[]');
    } catch {
        return [];
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/transactions/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }

        const order = orders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        alert('Cập nhật trạng thái thành công!');
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
        loadOrders();
    }
}

function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const fallbackUser = users.find(u => u.id === order.userId);
    const products = parseProducts(order.products);
    const customerName = order.customerName || fallbackUser?.name || 'Khách lẻ';
    const customerEmail = order.customerEmail || fallbackUser?.email || 'N/A';
    const customerPhone = order.customerPhone || fallbackUser?.phone || 'N/A';
    const shippingAddress = order.shippingAddress || fallbackUser?.address || 'N/A';

    const productsHTML = products.length > 0 ? `
        <table style="width: 100%; margin-top: 15px;">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Phân loại</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.productName || p.name || 'Sản phẩm'}</td>
                        <td>${[p.size ? `Size ${p.size}` : '', p.color ? `Màu ${p.color}` : ''].filter(Boolean).join(' / ') || 'N/A'}</td>
                        <td>${p.quantity}</td>
                        <td>${formatCurrency(p.price)}</td>
                        <td>${formatCurrency(Number(p.price || 0) * Number(p.quantity || 0))}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>Không thể hiển thị chi tiết sản phẩm</p>';

    const detailContent = `
        <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px;">
                <p><strong>Mã đơn:</strong> #${order.id}</p>
                <p><strong>Trạng thái:</strong> ${getStatusBadge(order.status)}</p>
                <p><strong>Khách hàng:</strong> ${customerName}</p>
                <p><strong>Số điện thoại:</strong> ${customerPhone}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Thanh toán:</strong> ${order.paymentMethod === 'qr' ? 'Chuyển khoản QR' : 'COD'}</p>
                <p style="grid-column: 1 / -1;"><strong>Địa chỉ giao hàng:</strong> ${shippingAddress}</p>
                ${order.note ? `<p style="grid-column: 1 / -1;"><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
                <p><strong>Ngày đặt:</strong> ${order.date}</p>
            </div>

            <h3>Sản phẩm</h3>
            ${productsHTML}

            <div style="margin-top: 20px; text-align: right;">
                <h3>Tổng tiền: ${formatCurrency(order.totalAmount)}</h3>
            </div>
        </div>
    `;

    document.getElementById('orderDetailContent').innerHTML = detailContent;
    document.getElementById('orderDetailModal').classList.add('active');
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeOrderModal')?.addEventListener('click', closeOrderDetailModal);

    window.addEventListener('click', event => {
        const modal = document.getElementById('orderDetailModal');
        if (event.target === modal) {
            closeOrderDetailModal();
        }
    });
});

window.loadOrders = loadOrders;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetail = viewOrderDetail;
