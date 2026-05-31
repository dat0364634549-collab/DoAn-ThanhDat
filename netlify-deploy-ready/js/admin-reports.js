async function loadReports() {
    await Promise.all([
        loadReportSummary(),
        loadRevenueByDate(),
        loadRevenueByMonth(),
        loadBestSellingProducts()
    ]);
}

async function loadReportSummary() {
    try {
        const [revenueRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/transactions/revenue`),
            fetch(`${API_URL}/transactions`)
        ]);
        
        const totalRevenue = await revenueRes.json();
        const orders = await ordersRes.json();
        
        const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        document.getElementById('reportTotalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('reportTotalOrders').textContent = orders.length;
        document.getElementById('reportAvgOrder').textContent = formatCurrency(avgOrder);
    } catch (error) {
        console.error('Error loading report summary:', error);
    }
}

async function loadRevenueByDate(startDate = null, endDate = null) {
    try {
        let url = `${API_URL}/transactions/statistics/revenue-by-date`;
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        renderRevenueByDate(data);
    } catch (error) {
        console.error('Error loading revenue by date:', error);
    }
}

function renderRevenueByDate(data) {
    const tbody = document.getElementById('revenueByDateTable');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Không có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.orders}</td>
            <td>${formatCurrency(item.revenue)}</td>
        </tr>
    `).join('');
    
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    
    tbody.innerHTML += `
        <tr style="font-weight: bold; background-color: #f8f9fa;">
            <td>Tổng</td>
            <td>${totalOrders}</td>
            <td>${formatCurrency(totalRevenue)}</td>
        </tr>
    `;
}

async function loadRevenueByMonth(year = null) {
    try {
        let url = `${API_URL}/transactions/statistics/revenue-by-month`;
        if (year) {
            url += `?year=${year}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        renderRevenueByMonth(data);
    } catch (error) {
        console.error('Error loading revenue by month:', error);
    }
}

function renderRevenueByMonth(data) {
    const tbody = document.getElementById('revenueByMonthTable');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Không có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => {
        const monthName = formatMonth(item.month);
        return `
            <tr>
                <td>${monthName}</td>
                <td>${item.orders}</td>
                <td>${formatCurrency(item.revenue)}</td>
            </tr>
        `;
    }).join('');
    
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    
    tbody.innerHTML += `
        <tr style="font-weight: bold; background-color: #f8f9fa;">
            <td>Tổng</td>
            <td>${totalOrders}</td>
            <td>${formatCurrency(totalRevenue)}</td>
        </tr>
    `;
}

function formatMonth(monthStr) {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [year, month] = monthStr.split('-');
    return `Tháng ${parseInt(month)}/${year}`;
}

async function loadBestSellingProducts() {
    try {
        const response = await fetch(`${API_URL}/transactions/statistics/best-selling-products?limit=10`);
        const data = await response.json();
        
        renderBestSellingProducts(data);
    } catch (error) {
        console.error('Error loading best selling products:', error);
    }
}

function renderBestSellingProducts(data) {
    const tbody = document.getElementById('bestSellingTable');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Không có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td>${item.totalQuantity}</td>
            <td>${formatCurrency(item.totalRevenue)}</td>
        </tr>
    `).join('');
    
    const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    tbody.innerHTML += `
        <tr style="font-weight: bold; background-color: #f8f9fa;">
            <td colspan="2">Tổng</td>
            <td>${totalQuantity}</td>
            <td>${formatCurrency(totalRevenue)}</td>
        </tr>
    `;
}

function setupReportFilters() {
    document.getElementById('filterByDateBtn')?.addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        loadRevenueByDate(startDate, endDate);
    });
    
    document.getElementById('filterByMonthBtn')?.addEventListener('click', () => {
        const year = document.getElementById('filterYear').value;
        loadRevenueByMonth(year ? parseInt(year) : null);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupReportFilters();
});

window.loadReports = loadReports;

