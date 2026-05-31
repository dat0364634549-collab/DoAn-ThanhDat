// Chức năng tìm kiếm dropdown chung cho tất cả các trang
class SearchDropdown {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchDropdown = null;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        if (!this.searchInput) return;

        // Tạo dropdown element nếu chưa có
        this.createDropdown();
        
        // Thêm event listeners
        this.addEventListeners();
    }

    createDropdown() {
        const searchBar = this.searchInput.parentElement;
        if (!searchBar) return;

        // Kiểm tra xem dropdown đã tồn tại chưa
        this.searchDropdown = document.getElementById('searchDropdown');
        if (!this.searchDropdown) {
            this.searchDropdown = document.createElement('div');
            this.searchDropdown.id = 'searchDropdown';
            this.searchDropdown.className = 'search-dropdown';
            searchBar.appendChild(this.searchDropdown);
        }

        // Thêm CSS nếu chưa có
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('search-dropdown-styles')) return;

        const style = document.createElement('style');
        style.id = 'search-dropdown-styles';
        style.textContent = `
        .search-bar {
            position: relative;
        }

        .search-bar input {
            color: white !important;
        }

        .search-bar input::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
        }

            .search-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                display: none;
                margin-top: 5px;
            }

            .search-dropdown.show {
                display: block;
            }

            .search-item {
                display: flex;
                align-items: center;
                padding: 12px 15px;
                cursor: pointer;
                transition: background 0.2s ease;
                border-bottom: 1px solid #f0f0f0;
            }

            .search-item:last-child {
                border-bottom: none;
            }

            .search-item:hover {
                background: #f8f9fa;
            }

            .search-item img {
                width: 40px;
                height: 40px;
                object-fit: cover;
                border-radius: 5px;
                margin-right: 12px;
            }

            .search-item-info {
                flex: 1;
            }

            .search-item-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .search-item-price {
                color: #ff6f61;
                font-weight: bold;
                font-size: 13px;
            }

            .search-item-category {
                color: #666;
                font-size: 12px;
                margin-top: 2px;
            }

            .search-no-results {
                padding: 20px;
                text-align: center;
                color: #666;
                font-style: italic;
            }

            .search-loading {
                padding: 20px;
                text-align: center;
                color: #666;
            }

            .search-loading i {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    addEventListeners() {
        // Input event
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(this.searchTimeout);
            
            if (query.length < 2) {
                this.hideDropdown();
                return;
            }

            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Focus event
        this.searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim().length >= 2) {
                this.performSearch(e.target.value.trim());
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.searchDropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    getSearchProducts() {
        return [
            {
                id: '1',
                name: 'Áo thun MLB New York Yankees',
                price: 450000,
                discount: 20,
                image: 'images/mlb1.jpg',
                category: 'Áo thun'
            },
            {
                id: '2',
                name: 'Quần short MLB Boston Red Sox',
                price: 320000,
                discount: 15,
                image: 'images/mlb2.jpg',
                category: 'Quần short'
            },
            {
                id: '3',
                name: 'Áo khoác MLB Los Angeles Dodgers',
                price: 680000,
                discount: 25,
                image: 'images/mlb3.jpg',
                category: 'Áo khoác'
            },
            {
                id: '4',
                name: 'Mũ lưỡi trai MLB Chicago Cubs',
                price: 180000,
                discount: 10,
                image: 'images/mlb4.jpg',
                category: 'Phụ kiện'
            },
            {
                id: '5',
                name: 'Túi đeo chéo MLB San Francisco Giants',
                price: 250000,
                discount: 0,
                image: 'images/mlb7.jpg',
                category: 'Phụ kiện'
            },
            {
                id: '6',
                name: 'Áo polo MLB Miami Marlins',
                price: 380000,
                discount: 15,
                image: 'images/mlb8.jpg',
                category: 'Áo polo'
            },
            {
                id: '7',
                name: 'Quần jean MLB Detroit Tigers',
                price: 520000,
                discount: 20,
                image: 'images/mlb9.jpg',
                category: 'Quần jean'
            },
            {
                id: '8',
                name: 'Giày thể thao MLB Atlanta Braves',
                price: 890000,
                discount: 30,
                image: 'images/mlb11.jpg',
                category: 'Giày'
            }
        ];
    }

    performSearch(query) {
        this.showLoading();
        
        setTimeout(() => {
            const products = this.getSearchProducts();
            const results = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            
            this.displayResults(results);
        }, 200);
    }

    showLoading() {
        this.searchDropdown.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner"></i>
                <p>Đang tìm kiếm...</p>
            </div>
        `;
        this.searchDropdown.classList.add('show');
    }

    displayResults(results) {
        if (results.length === 0) {
            this.searchDropdown.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>Không tìm thấy sản phẩm nào</p>
                </div>
            `;
        } else {
            const html = results.map(product => {
                const discountPrice = product.discount > 0 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price;
                
                return `
                    <div class="search-item" onclick="goToProduct('${product.id}')">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="search-item-info">
                            <div class="search-item-name">${product.name}</div>
                            <div class="search-item-price">${discountPrice.toLocaleString()}đ</div>
                            <div class="search-item-category">${product.category}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            this.searchDropdown.innerHTML = html;
        }
        
        this.searchDropdown.classList.add('show');
    }

    hideDropdown() {
        this.searchDropdown.classList.remove('show');
    }
}

// Global function để chuyển đến trang sản phẩm
function goToProduct(productId) {
    window.location.href = `chitiet.html?id=${productId}`;
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    new SearchDropdown();
});
