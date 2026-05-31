document.addEventListener('DOMContentLoaded', function() {
    const cartButton = document.getElementById('cartButton');
    const cartPopup = document.getElementById('cartPopup');
    const cartPopupClose = document.getElementById('cartPopupClose');
    const cartPopupContent = document.getElementById('cartPopupContent');

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    function updateCartBadge() {
        const totalItems = getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }

    function renderCartPopup() {
        const cart = getCart();

        if (!cartPopupContent) return;

        if (cart.length === 0) {
            cartPopupContent.innerHTML = `
                <div class="cart-popup-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Giỏ hàng trống</h3>
                    <p>Chọn một sản phẩm yêu thích rồi quay lại đây để thanh toán.</p>
                    <a class="cart-popup-btn primary" href="products.html">Mua sắm ngay</a>
                </div>
            `;
            return;
        }

        let total = 0;
        const itemsHtml = cart.map(item => {
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const itemTotal = price * quantity;
            total += itemTotal;

            return `
                <div class="cart-line">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-line-info">
                        <div class="cart-line-name">${item.name}</div>
                        <div class="cart-line-meta">
                            ${item.size ? `<span>Size ${item.size}</span>` : ''}
                            ${item.color ? `<span>Màu ${item.color}</span>` : ''}
                        </div>
                        <div class="cart-line-price">${price.toLocaleString()}đ</div>
                    </div>
                    <div class="cart-line-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                            <span>${quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                        </div>
                        <div class="cart-line-total">${itemTotal.toLocaleString()}đ</div>
                        <button class="remove-btn" data-id="${item.id}">Xóa</button>
                    </div>
                </div>
            `;
        }).join('');

        cartPopupContent.innerHTML = `
            <div class="cart-lines">${itemsHtml}</div>
            <div class="cart-popup-total">
                <span>Tổng cộng</span>
                <span class="total-amount">${total.toLocaleString()}đ</span>
            </div>
            <div class="cart-popup-actions">
                <button class="cart-popup-btn secondary" type="button" onclick="closeCartPopup()">Tiếp tục mua</button>
                <button class="cart-popup-btn primary" type="button" onclick="proceedToCheckout()">Thanh toán</button>
            </div>
        `;

        cartPopupContent.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', () => updateQuantity(button.dataset.id, Number(button.dataset.change)));
        });

        cartPopupContent.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', () => removeFromCart(button.dataset.id));
        });
    }

    function updateQuantity(productId, change) {
        let cart = getCart();
        const item = cart.find(cartItem => String(cartItem.id) === String(productId));
        if (!item) return;

        item.quantity = Number(item.quantity || 1) + change;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => String(cartItem.id) !== String(productId));
        }
        saveCart(cart);
        renderCartPopup();
    }

    function removeFromCart(productId) {
        const cart = getCart().filter(item => String(item.id) !== String(productId));
        saveCart(cart);
        renderCartPopup();
    }

    window.closeCartPopup = function() {
        cartPopup?.classList.remove('show');
    };

    window.proceedToCheckout = function() {
        window.location.href = 'pay.html';
    };

    if (cartButton && cartPopup) {
        cartButton.addEventListener('click', event => {
            event.preventDefault();
            renderCartPopup();
            cartPopup.classList.add('show');
        });

        cartPopupClose?.addEventListener('click', window.closeCartPopup);

        cartPopup.addEventListener('click', event => {
            if (event.target === cartPopup) {
                window.closeCartPopup();
            }
        });
    }

    updateCartBadge();
});
