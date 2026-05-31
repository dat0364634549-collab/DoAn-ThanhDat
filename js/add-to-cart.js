function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function addToCart(button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = `
        <span class="spinner"></span>
        <span>Đang thêm...</span>
    `;

    const product = {
        id: button.getAttribute('data-id'),
        name: button.getAttribute('data-name'),
        price: parseFloat(button.getAttribute('data-price')),
        image: button.getAttribute('data-image'),
        quantity: 1
    };

    setTimeout(() => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();

        button.classList.remove('loading');
        button.classList.add('success');
        button.innerHTML = `
            <i class="fas fa-check"></i>
            <span>Đã thêm!</span>
        `;

        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');

        setTimeout(() => {
            button.classList.remove('success');
            button.disabled = false;
            button.innerHTML = originalText;
        }, 2000);
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.add-to-cart-btn');
        if (button) {
            e.preventDefault();
            addToCart(button);
        }
    });
});

