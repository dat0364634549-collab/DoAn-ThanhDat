let allUsers = [];
let userTransactions = {};
let currentUserSearch = '';
let currentUserStatus = 'all';

async function loadUsers() {
    try {
        const [usersRes, transactionsRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/transactions`)
        ]);
        
        allUsers = await usersRes.json();
        const transactions = await transactionsRes.json();
        
        userTransactions = {};
        transactions.forEach(t => {
            if (!userTransactions[t.userId]) {
                userTransactions[t.userId] = 0;
            }
            userTransactions[t.userId]++;
        });
        
        setupUserFilters();
        renderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTable');
    const regularUsers = allUsers.filter(u => u.role === 'user');
    const filteredUsers = regularUsers.filter(user => {
        const keyword = currentUserSearch.toLowerCase();
        const matchesKeyword = !keyword ||
            `${user.name || ''} ${user.email || ''} ${user.phone || ''}`.toLowerCase().includes(keyword);
        const matchesStatus =
            currentUserStatus === 'all' ||
            (currentUserStatus === 'active' && !user.isLocked) ||
            (currentUserStatus === 'locked' && user.isLocked);

        return matchesKeyword && matchesStatus;
    });

    updateUserSummary(regularUsers);
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><h3>Không tìm thấy khách hàng phù hợp</h3></td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => {
        const orderCount = userTransactions[user.id] || 0;
        const firstLetter = (user.name || user.email || 'K').trim().charAt(0).toUpperCase();
        const statusBadge = user.isLocked 
            ? '<span class="customer-status locked">Đã khóa</span>' 
            : '<span class="customer-status active">Hoạt động</span>';
        
        return `
            <tr>
                <td><span class="customer-id">#${user.id}</span></td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${firstLetter}</div>
                        <div>
                            <strong>${user.name || 'Khách hàng'}</strong>
                            <span>${user.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="customer-contact">
                        <span>${user.email || 'Chưa có email'}</span>
                        <small>${user.phone || 'Chưa có số điện thoại'}</small>
                    </div>
                </td>
                <td>${user.registeredDate || '--'}</td>
                <td><span class="order-count-pill">${orderCount}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm customer-action ${user.isLocked ? 'unlock' : 'lock'}" 
                            onclick="toggleLockUser(${user.id}, ${!user.isLocked})">
                        ${user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateUserSummary(users) {
    const total = users.length;
    const locked = users.filter(user => user.isLocked).length;
    const active = total - locked;

    const totalEl = document.getElementById('userTotalCount');
    const activeEl = document.getElementById('userActiveCount');
    const lockedEl = document.getElementById('userLockedCount');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (lockedEl) lockedEl.textContent = locked;
}

function setupUserFilters() {
    const searchInput = document.getElementById('userSearchInput');
    const statusFilter = document.getElementById('userStatusFilter');

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', () => {
            currentUserSearch = searchInput.value.trim();
            renderUsers();
        });
    }

    if (statusFilter && !statusFilter.dataset.bound) {
        statusFilter.dataset.bound = 'true';
        statusFilter.addEventListener('change', () => {
            currentUserStatus = statusFilter.value;
            renderUsers();
        });
    }
}

async function toggleLockUser(userId, shouldLock) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const action = shouldLock ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/${userId}/lock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLocked: shouldLock })
        });
        
        if (response.ok) {
            user.isLocked = shouldLock;
            alert(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công!`);
            renderUsers();
        } else {
            const error = await response.json();
            alert(error.message || `Có lỗi xảy ra khi ${action} tài khoản!`);
        }
    } catch (error) {
        console.error('Error toggling user lock:', error);
        alert(`Có lỗi xảy ra khi ${action} tài khoản!`);
    }
}

window.loadUsers = loadUsers;
window.toggleLockUser = toggleLockUser;
