let products = [];
let editingProductId = null;

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsTable');

    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><h3>Chưa có sản phẩm nào</h3><p>Nhấn "Thêm sản phẩm" để bắt đầu</p></td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>#${product.id}</td>
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.stock}</td>
            <td>${product.totalSold || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'ao-thun': 'Áo thun',
        'quan-thun': 'Quần thun',
        'ao-khoac': 'Áo khoác',
        'vay': 'Váy'
    };
    return categories[category] || category;
}

function openProductModal(isEdit = false) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = modal?.querySelector('.modal-content');

    if (!modal || !modalTitle) return;

    modalTitle.textContent = isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    if (!isEdit) {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('productImagePath').value = '';
        editingProductId = null;
    }

    requestAnimationFrame(() => {
        modal.scrollTop = 0;
        if (modalContent) modalContent.scrollTop = 0;
        const nameInput = document.getElementById('productName');
        nameInput?.scrollIntoView({ block: 'center' });
        nameInput?.focus();
    });
}

function closeProductModal() {
    document.getElementById('productModal')?.classList.remove('active');
    document.body.classList.remove('modal-open');
    editingProductId = null;
}

async function editProduct(id) {
    let product = products.find(p => p.id === id);

    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (response.ok) {
            product = await response.json();
        }
    } catch (error) {
        console.warn('Không lấy được sản phẩm mới nhất, dùng dữ liệu trong bảng:', error);
    }

    if (!product) return;

    editingProductId = id;

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || 0;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productDiscount').value = product.discount || 0;
    document.getElementById('productIsHot').checked = !!product.isHot;
    document.getElementById('productImagePath').value = product.image || '';
    document.getElementById('productImage').value = '';

    if (product.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${product.image}" alt="Preview">`;
    } else {
        document.getElementById('imagePreview').innerHTML = '';
    }

    openProductModal(true);
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            loadProducts();
        } else {
            alert('Có lỗi xảy ra khi xóa sản phẩm!');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm!');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const oldProduct = editingProductId ? products.find(p => p.id === editingProductId) : null;
    const productData = {
        id: editingProductId || 0,
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value, 10),
        discount: parseInt(document.getElementById('productDiscount').value, 10) || 0,
        isHot: document.getElementById('productIsHot').checked,
        image: document.getElementById('productImagePath').value || oldProduct?.image || 'images/default.jpg',
        totalSold: oldProduct?.totalSold || 0
    };

    if (!productData.name) {
        alert('Vui lòng nhập tên sản phẩm!');
        document.getElementById('productName').focus();
        return;
    }

    try {
        let response;
        if (editingProductId) {
            productData.id = editingProductId;
            response = await fetch(`${API_URL}/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            alert(editingProductId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            closeProductModal();
            await loadProducts();
        } else {
            const errorText = await response.text();
            console.error('Save product failed:', errorText);
            alert('Có lỗi xảy ra khi lưu sản phẩm!');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Có lỗi xảy ra khi lưu sản phẩm!');
    }
}

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/products/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('productImagePath').value = result.path;
            document.getElementById('imagePreview').innerHTML = `<img src="${result.path}" alt="Preview">`;
        } else {
            const error = await response.json();
            alert(error.message || 'Lỗi khi upload ảnh!');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Lỗi khi upload ảnh!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal(false));
    document.getElementById('closeModal')?.addEventListener('click', closeProductModal);
    document.getElementById('cancelBtn')?.addEventListener('click', closeProductModal);
    document.getElementById('productForm')?.addEventListener('submit', handleProductSubmit);
    document.getElementById('productImage')?.addEventListener('change', handleImageUpload);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) closeProductModal();
    });
});

window.loadProducts = loadProducts;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
