const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Initialize Lucide Icons
lucide.createIcons();

// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://neonapp-a05b0-default-rtdb.firebaseio.com/" // ЗАМЕНИТЕ НА ВАШ URL ИЗ .env
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let products = [];
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let isAdmin = false;

// Check Admin status from URL
const urlParams = new URLSearchParams(window.location.search);
isAdmin = urlParams.get('admin') === 'true';

if (isAdmin) {
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.classList.remove('hidden');
        adminBtn.onclick = openAdmin;
    }
}

// Preloader Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('loader-hidden');
    }, 1500);
});

// Load Products from Firebase
function loadProducts() {
    db.ref('products').on('value', (snapshot) => {
        const data = snapshot.val();
        products = [];
        if (data) {
            Object.keys(data).forEach(key => {
                products.push({ id: key, ...data[key] });
            });
        }
        renderProducts();
        if (isAdmin) renderAdminProductList();
    });
}

// Search Logic
document.getElementById('search-btn').onclick = () => {
    const input = document.getElementById('search-input');
    input.focus();
};

document.getElementById('search-input').oninput = (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
};

// Cart Logic
document.getElementById('cart-btn').onclick = () => openCart();

function openCart() {
    renderCart();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-drawer-backdrop').classList.remove('opacity-100', 'pointer-events-auto');
}

document.getElementById('cart-drawer-backdrop').onclick = closeCart;

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartBadge();
        updateMainButton();
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        
        const cartBtn = document.getElementById('cart-btn');
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartBadge();
    updateMainButton();
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (cart.length > 0) {
        badge.innerText = cart.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center opacity-40">
                <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-4"></i>
                <p>Ваша корзина пуста</p>
            </div>
        `;
        totalEl.innerText = '$0';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl animate-in">
                <div class="w-16 h-16 rounded-xl bg-black flex items-center justify-center overflow-hidden shrink-0">
                    <img src="${item.image_url}" class="w-full h-full object-contain" onerror="this.src='https://via.placeholder.com/100'">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-bold text-sm truncate">${item.name}</h4>
                    <p class="text-amber-500 text-xs font-bold">$${item.price}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="w-10 h-10 flex items-center justify-center text-red-500/50 active:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        totalEl.innerText = `$${total}`;
    }
    lucide.createIcons();
}

function filterProducts(category, el) {
    activeCategory = category;
    document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    renderProducts();
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 py-12 text-center opacity-40 text-white">Ничего не найдено</div>`;
        return;
    }

    grid.innerHTML = filtered.map((p, index) => `
        <div class="glass-card p-5 flex flex-col gap-4 animate-in" 
             style="animation-delay: ${index * 0.03}s"
             onclick="openProduct('${p.id}')">
            <div class="product-image-container relative aspect-square bg-white/5 rounded-2xl overflow-hidden">
                <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-contain p-2"
                     onerror="this.src='https://via.placeholder.com/200'">
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"></div>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-[10px] text-[#FFB800] font-extrabold uppercase tracking-[0.15em] opacity-80">${p.category}</p>
                <h3 class="font-bold text-[15px] text-white leading-tight tracking-tight">${p.name}</h3>
            </div>
            <div class="flex justify-between items-center mt-auto pt-1">
                <span class="font-bold text-[18px] text-white">$${p.price}</span>
                <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/80 active:bg-[#FFB800] active:text-black transition-all">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

let currentProduct = null;

function openProduct(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;

    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-brand').innerText = currentProduct.category.toUpperCase();
    document.getElementById('modal-price').innerText = `$${currentProduct.price}`;
    document.getElementById('modal-price-btn').innerText = `$${currentProduct.price}`;
    
    const modalImageContainer = document.getElementById('modal-image-container');
    modalImageContainer.innerHTML = `
        <img src="${currentProduct.image_url}" class="w-full h-full object-contain p-4 opacity-90" 
             onerror="this.src='https://via.placeholder.com/400'">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent pointer-events-none"></div>
    `;
    
    // Поддержка полей desc и protocol
    document.getElementById('tab-details').innerHTML = currentProduct.desc || "Описание ожидается...";
    document.getElementById('tab-protocol').innerHTML = currentProduct.protocol || "Протокол будет добавлен позже.";
    
    // Переключение на первую вкладку по умолчанию
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length > 0) switchTab('details', tabs[0]);
    
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('product-modal-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeProduct() {
    document.getElementById('product-modal').classList.remove('open');
    document.getElementById('product-modal-backdrop').classList.remove('opacity-100', 'pointer-events-auto');
}

document.getElementById('product-modal-backdrop').onclick = closeProduct;

function updateMainButton() {
    if (cart.length > 0) {
        const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ ($${total.toFixed(2)})`);
        tg.MainButton.show();
        tg.MainButton.offClick(handleCheckout); // Clear previous
        tg.MainButton.onClick(handleCheckout);
        tg.MainButton.setParams({ color: '#FFB800', text_color: '#000000' });
    } else {
        tg.MainButton.hide();
    }
}

function handleCheckout() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);
    tg.showConfirm(`Подтвердить заказ на сумму $${total.toFixed(2)}?`, (confirmed) => {
        if (confirmed) {
            const orderId = 'OPT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            db.ref('orders/' + orderId).set({
                userId: tg.initDataUnsafe.user?.id || 'guest',
                userName: tg.initDataUnsafe.user?.first_name || 'Guest',
                items: cart,
                status: 'new',
                total: total,
                timestamp: Date.now()
            }).then(() => {
                tg.showAlert(`Заказ ${orderId} оформлен!`);
                cart = [];
                updateMainButton();
                updateCartBadge();
            });
        }
    });
}

// --- ADMIN FUNCTIONS ---
function openAdmin() {
    document.getElementById('admin-modal').classList.add('open');
    document.getElementById('admin-modal-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    renderAdminProductList();
}

function closeAdmin() {
    document.getElementById('admin-modal').classList.remove('open');
    document.getElementById('admin-modal-backdrop').classList.remove('opacity-100', 'pointer-events-auto');
}

document.getElementById('admin-modal-backdrop').onclick = closeAdmin;

function saveProduct() {
    const name = document.getElementById('admin-name').value;
    const price = document.getElementById('admin-price').value;
    const category = document.getElementById('admin-category').value;
    const image_url = document.getElementById('admin-image').value;

    if (!name || !price || !image_url) {
        tg.showAlert("Заполните все поля!");
        return;
    }

    const productData = {
        name,
        price: parseFloat(price),
        category,
        image_url,
        desc: "Новый товар",
        protocol: "По инструкции"
    };

    db.ref('products').push(productData).then(() => {
        tg.showAlert("Товар добавлен!");
        document.getElementById('admin-name').value = '';
        document.getElementById('admin-price').value = '';
        document.getElementById('admin-image').value = '';
    });
}

window.deleteProduct = function(id) {
    if (confirm("Удалить этот товар?")) {
        db.ref('products/' + id).remove().then(() => {
            tg.showAlert("Товар удален");
        });
    }
};

window.updatePrice = function(id, currentPrice) {
    const newPrice = prompt("Введите новую цену:", currentPrice);
    if (newPrice !== null && !isNaN(newPrice)) {
        db.ref('products/' + id).update({ price: parseFloat(newPrice) });
    }
};

function renderAdminProductList() {
    const list = document.getElementById('admin-product-list');
    list.innerHTML = products.map(p => `
        <div class="bg-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <img src="${p.image_url}" class="w-10 h-10 object-contain rounded-lg bg-black">
                <div>
                    <p class="text-white font-bold text-sm">${p.name}</p>
                    <p class="text-[#FFB800] text-xs">$${p.price}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="updatePrice('${p.id}', ${p.price})" class="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" class="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// Start Loading
loadProducts();

