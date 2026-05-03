const tg = window.Telegram.WebApp;
tg.expand();

// Включаем подтверждение закрытия только если поддерживается
if (tg.isVersionAtLeast('6.1')) {
    tg.enableClosingConfirmation();
}

lucide.createIcons();

// Безопасная функция для тактильной обратной связи
function safeHaptic(type = 'light') {
    try {
        if (tg.HapticFeedback && tg.isVersionAtLeast('6.1')) {
            switch(type) {
                case 'light':
                case 'medium':
                case 'heavy':
                    tg.HapticFeedback.impactOccurred(type);
                    break;
                case 'success':
                case 'error':
                case 'warning':
                    tg.HapticFeedback.notificationOccurred(type);
                    break;
            }
        }
    } catch (e) {
        // Игнорируем ошибки тактильной обратной связи
    }
}

// Безопасная функция для показа всплывающих окон
function safeAlert(message) {
    try {
        if (tg.isVersionAtLeast('6.2') && tg.showPopup) {
            tg.showPopup({
                title: 'Уведомление',
                message: message,
                buttons: [{text: 'OK'}]
            });
        } else {
            alert(message);
        }
    } catch (e) {
        alert(message);
    }
}

// Безопасная функция для подтверждения
function safeConfirm(message, callback) {
    try {
        if (tg.isVersionAtLeast('6.2') && tg.showConfirm) {
            tg.showConfirm(message, callback);
        } else {
            callback(confirm(message));
        }
    } catch (e) {
        callback(confirm(message));
    }
}

const firebaseConfig = {
    databaseURL: "https://neonapp-a05b0-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let products = [];
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let isAdmin = false;

// Check Admin status from URL or Telegram user data
const urlParams = new URLSearchParams(window.location.search);
isAdmin = urlParams.get('admin') === 'true' || tg.initDataUnsafe?.user?.id === 123456789; // Replace with your Telegram ID

if (isAdmin) {
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.classList.remove('hidden');
        adminBtn.onclick = openAdmin;
    }
    loadOrders();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('loader-hidden');
    }, 1500);
});

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

function loadOrders() {
    if (!isAdmin) return;
    db.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        orders = [];
        if (data) {
            Object.keys(data).forEach(key => {
                orders.push({ id: key, ...data[key] });
            });
        }
        orders.sort((a, b) => b.timestamp - a.timestamp);
        renderAdminOrders();
    });
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = products.filter(p => {
        const pCat = (p.category || "").trim().toLowerCase();
        const aCat = activeCategory.trim().toLowerCase();
        const matchesCategory = aCat === 'all' || pCat === aCat;
        const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 py-12 text-center opacity-40 text-white">В этой категории пока нет товаров</div>`;
        return;
    }

    grid.innerHTML = filtered.map((p, index) => {
        const imgSrc = p.image || p.image_url || "";
        return `
        <div class="glass-card p-5 flex flex-col gap-4 animate-in cursor-pointer" 
             style="animation-delay: ${index * 0.03}s"
             onclick="openProduct('${p.id}')">
            <div class="product-image-container relative aspect-square bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
                <img src="${imgSrc}" alt="${p.name}" class="w-full h-full object-contain p-2"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                <i data-lucide="${p.icon || 'droplet'}" class="hidden w-12 h-12 text-[#FFB800]/20"></i>
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"></div>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-[10px] text-[#FFB800] font-extrabold uppercase tracking-[0.15em] opacity-80">${p.brand || 'OPTRA'}</p>
                <h3 class="font-bold text-[15px] text-white leading-tight tracking-tight">${p.name}</h3>
            </div>
            <div class="flex justify-between items-center mt-auto pt-1">
                <span class="font-bold text-[18px] text-white">$${p.price}</span>
                <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/80 active:bg-[#FFB800] active:text-black transition-all">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

let currentProduct = null;
let orders = [];
let activeOrderFilter = 'all';

function openProduct(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;

    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-brand').innerText = `${currentProduct.brand || 'OPTRA'} Laboratory`;
    document.getElementById('modal-price').innerText = `$${currentProduct.price}`;
    document.getElementById('modal-price-btn').innerText = `$${currentProduct.price}`;
    
    const modalImageContainer = document.getElementById('modal-image-container');
    const imgSrc = currentProduct.image || currentProduct.image_url || '';
    
    modalImageContainer.innerHTML = `
        <img src="${imgSrc}" class="w-full h-full object-contain p-4 opacity-90" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
        <i data-lucide="${currentProduct.icon || 'droplet'}" class="hidden w-24 h-24 text-[#FFB800]/20 absolute"></i>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent pointer-events-none"></div>
    `;
    
    document.getElementById('tab-details').innerHTML = currentProduct.desc || "Описание ожидается...";
    document.getElementById('tab-protocol').innerHTML = currentProduct.protocol || "Протокол будет добавлен позже.";
    
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length > 0) switchTab('details', tabs[0]);
    
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('product-modal-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    
    safeHaptic('light');
}

function switchTab(tabName, el) {
    if (!el) return;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-white');
        btn.classList.add('text-gray-500');
    });
    el.classList.add('active', 'text-white');
    el.classList.remove('text-gray-500');

    const tabContent = document.getElementById('tab-content');
    tabContent.style.opacity = 0;
    
    setTimeout(() => {
        document.getElementById('tab-details').classList.add('hidden');
        document.getElementById('tab-protocol').classList.add('hidden');
        document.getElementById('tab-' + tabName).classList.remove('hidden');
        tabContent.style.opacity = 1;
    }, 150);
    
    safeHaptic('light');
}

function closeProduct() {
    document.getElementById('product-modal').classList.remove('open');
    document.getElementById('product-modal-backdrop').classList.remove('opacity-100', 'pointer-events-auto');
}

document.getElementById('product-modal-backdrop').onclick = closeProduct;

document.getElementById('search-btn').onclick = () => {
    const input = document.getElementById('search-input');
    input.focus();
};

document.getElementById('search-input').oninput = (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
};

document.getElementById('cart-btn').onclick = () => openCart();

function openCart() {
    renderCart();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    safeHaptic('light');
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
        safeHaptic('success');
        
        // Анимация кнопки корзины
        const cartBtn = document.getElementById('cart-btn');
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
    }
}

function addToCartFromModal() {
    if (currentProduct) {
        addToCart(currentProduct.id);
        closeProduct();
        safeHaptic('success');
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartBadge();
    updateMainButton();
    safeHaptic('light');
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
        container.innerHTML = `<div class="py-12 text-center opacity-40"><i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-4"></i><p>Ваша корзина пуста</p></div>`;
        totalEl.innerText = '$0';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl animate-in">
                <div class="w-16 h-16 rounded-xl bg-black flex items-center justify-center overflow-hidden shrink-0">
                    <img src="${item.image || item.image_url}" class="w-full h-full object-contain" onerror="this.src='https://via.placeholder.com/100'">
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
        totalEl.innerText = `$${total.toFixed(2)}`;
    }
    lucide.createIcons();
}

function filterProducts(category, el) {
    activeCategory = category;
    document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    renderProducts();
    safeHaptic('light');
}

function updateMainButton() {
    if (cart.length > 0) {
        const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ ($${total.toFixed(2)})`);
        tg.MainButton.show();
        tg.MainButton.offClick(handleCheckout);
        tg.MainButton.onClick(handleCheckout);
        tg.MainButton.setParams({ color: '#FFB800', text_color: '#000000' });
    } else {
        tg.MainButton.hide();
    }
}

function handleCheckout() {
    safeHaptic('medium');
    
    const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const user = tg.initDataUnsafe.user;
    const orderText = cart.map(item => `• ${item.name} - $${item.price}`).join('\\n');
    
    safeConfirm(`Подтвердить заказ на сумму $${total.toFixed(2)}?`, (confirmed) => {
        if (confirmed) {
            const orderId = 'OPT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            // Сохраняем заказ в Firebase
            db.ref('orders/' + orderId).set({
                userId: user?.id || 'guest',
                userName: user?.first_name || 'Guest',
                userUsername: user?.username || 'unknown',
                items: cart,
                status: 'pending', // pending, accepted, rejected
                total: total,
                timestamp: Date.now()
            }).then(() => {
                // Отправляем сообщение вам через Telegram Bot API
                const botToken = '8771687545:AAHheZqYf_myfyGUgutE3nYXrmfhmj0TLV4'; // Токен вашего бота
                const yourChatId = '6201234513'; // Ваш ID администратора
                
                const message = `🛒 НОВЫЙ ЗАКАЗ #${orderId}\\n` +
                               `👤 Клиент: ${user?.first_name || 'Guest'} (@${user?.username || 'unknown'})\\n` +
                               `💰 Сумма: $${total.toFixed(2)}\\n\\n` +
                               `📦 Товары:\\n${orderText}\\n\\n` +
                               `⏰ Время: ${new Date().toLocaleString()}`;
                
                // Отправляем уведомление в тот же бот с кнопками для общения
                if (botToken && botToken !== 'YOUR_BOT_TOKEN') {
                    const keyboard = {
                        inline_keyboard: [
                            [
                                { text: '✅ Принять заказ', callback_data: `accept_${orderId}` },
                                { text: '❌ Отклонить', callback_data: `reject_${orderId}` }
                            ],
                            [
                                { text: '💬 Написать клиенту', callback_data: `chat_${user?.id || 'guest'}_${orderId}` }
                            ]
                        ]
                    };

                    console.log('Отправка заказа в Telegram:', { 
                    botToken, 
                    yourChatId, 
                    message, 
                    userId: user?.id,
                    orderId,
                    callback_data: `chat_${user?.id || 'guest'}_${orderId}`
                });
                    
                    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: yourChatId,
                            text: message,
                            parse_mode: 'HTML',
                            reply_markup: keyboard
                        })
                    }).then(response => {
                        console.log('Response status:', response.status);
                        if (!response.ok) {
                            console.error('Ошибка отправки в Telegram:', response.status, response.statusText);
                            response.text().then(text => console.error('Error details:', text));
                        } else {
                            console.log('✅ Заказ успешно отправлен в Telegram');
                        }
                    }).catch(err => {
                        console.error('Ошибка отправки уведомления:', err);
                    });
                } else {
                    console.warn('Telegram Bot API не настроен. Проверьте botToken в script.js или ENV переменную BOT_TOKEN');
                }
                
                safeAlert(`Заказ ${orderId} оформлен! С вами свяжутся в ближайшее время.`);
                cart = [];
                updateMainButton();
                updateCartBadge();
                closeCart();
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

window.saveProduct = function() {
    const id = document.getElementById('admin-product-id').value;
    const name = document.getElementById('admin-name').value;
    const brand = document.getElementById('admin-brand').value;
    const price = document.getElementById('admin-price').value;
    const category = document.getElementById('admin-category').value;
    const image = document.getElementById('admin-image').value;
    const desc = document.getElementById('admin-desc').value;
    const protocol = document.getElementById('admin-protocol').value;

    if (!name || !price || !image) {
        safeAlert("Заполните название, цену и фото!");
        return;
    }

    const productData = {
        name,
        brand: brand || 'OPTRA',
        price: parseFloat(price),
        category,
        image,
        desc: desc || "Описание ожидается...",
        protocol: protocol || "Протокол будет добавлен позже.",
        icon: category === 'inject' ? 'droplet' : (category === 'oral' ? 'pill' : 'dna')
    };

    const ref = db.ref('products');
    if (id) {
        ref.child(id).update(productData).then(() => {
            safeAlert("Товар обновлен!");
            resetAdminForm();
        });
    } else {
        ref.push(productData).then(() => {
            safeAlert("Товар добавлен!");
            resetAdminForm();
        });
    }
};

window.editProduct = function(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    document.getElementById('admin-form-title').innerText = "Редактировать товар";
    document.getElementById('admin-product-id').value = p.id;
    document.getElementById('admin-name').value = p.name || '';
    document.getElementById('admin-brand').value = p.brand || '';
    document.getElementById('admin-price').value = p.price || '';
    document.getElementById('admin-category').value = p.category || 'inject';
    document.getElementById('admin-image').value = p.image || p.image_url || '';
    document.getElementById('admin-desc').value = p.desc || '';
    document.getElementById('admin-protocol').value = p.protocol || '';
    document.getElementById('admin-cancel-btn').classList.remove('hidden');
    document.getElementById('admin-save-btn').innerText = "Обновить";
    document.getElementById('admin-modal').scrollTo({ top: 0, behavior: 'smooth' });
};

window.resetAdminForm = function() {
    document.getElementById('admin-form-title').innerText = "Добавить товар";
    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-name').value = '';
    document.getElementById('admin-brand').value = '';
    document.getElementById('admin-price').value = '';
    document.getElementById('admin-category').value = 'inject';
    document.getElementById('admin-image').value = '';
    document.getElementById('admin-desc').value = '';
    document.getElementById('admin-protocol').value = '';
    document.getElementById('admin-cancel-btn').classList.add('hidden');
    document.getElementById('admin-save-btn').innerText = "Сохранить";
};

window.deleteProduct = function(id) {
    if (confirm("Удалить этот товар?")) {
        db.ref('products/' + id).remove().then(() => safeAlert("Товар удален"));
    }
};

function renderAdminProductList() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;
    list.innerHTML = products.map(p => `
        <div class="bg-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <img src="${p.image || p.image_url}" class="w-10 h-10 object-contain rounded-lg bg-black" onerror="this.src='https://via.placeholder.com/50'">
                <div>
                    <p class="text-white font-bold text-sm truncate max-w-[120px]">${p.name}</p>
                    <p class="text-[#FFB800] text-xs font-bold">$${p.price}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editProduct('${p.id}')" class="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center"><i data-lucide="edit-3" class="w-5 h-5"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

window.emergencySeed = function() {
    if (!confirm("Загрузить все товары?")) return;
    const fullList = [
        { category: "inject", name: "Test undecanoate 250 mg/ml", brand: "Magnus Pharmaceuticals", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Эфир тестостерона длительного действия.", protocol: "250-500 мг раз в 10-14 дней." },
        { category: "inject", name: "DHB cypionate 100/1 mg/ml", brand: "ZPHC", price: 80, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Дигидроболденон — мощный анаболик.", protocol: "100-200 мг в неделю." },
        { category: "inject", name: "Test Enanthate 10ml 250mg/ml", brand: "ZPHC", price: 48, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Классический массонабор.", protocol: "250-500 мг в неделю." },
        { category: "inject", name: "Test Cypionate 10ml 250mg/ml", brand: "ZPHC", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Популярный эфир для силы.", protocol: "250-500 мг в неделю." },
        { category: "inject", name: "Test Propionate 10ml 100mg/ml", brand: "ZPHC", price: 32, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Короткий эфир для сушки.", protocol: "100 мг через день." },
        { category: "inject", name: "TriTren 10ml 150 mg/ml", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Смесь трех эфиров тренболона.", protocol: "150-300 мг в неделю." },
        { category: "inject", name: "Tren Enanthate 10ml 200mg/ml", brand: "ZPHC", price: 73, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Длинный тренболон для силы.", protocol: "200-400 мг в неделю." },
        { category: "inject", name: "Tren Hexa 10ml 100mg/ml", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Параболан для жесткости мышц.", protocol: "100-200 мг в неделю." },
        { category: "inject", name: "Tren Acetate 10ml 100mg/ml", brand: "ZPHC", price: 48, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Короткий тренболон для формы.", protocol: "100 мг через день." },
        { category: "inject", name: "Primobolan 100mg/ml 1ml*10amp", brand: "Balkan Pharmaceuticals", price: 100, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "shield", desc: "Безопасный анаболик для качества.", protocol: "300-600 мг в неделю." },
        { category: "inject", name: "Mast Enanthate 10ml 200mg", brand: "ZPHC", price: 100, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Мастерон для рельефа.", protocol: "400-600 мг в неделю." },
        { category: "inject", name: "Mast Propionate 10ml 100mg/ml", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Короткий мастерон перед стартом.", protocol: "100 мг через день." },
        { category: "inject", name: "Nand Phenylpropionate 10ml", brand: "ZPHC", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Быстрая дека для суставов.", protocol: "100-200 мг раз в 3 дня." },
        { category: "inject", name: "Nand Deca 10ml 250mg/ml", brand: "ZPHC", price: 60, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Классика для набора веса.", protocol: "250-500 мг в неделю." },
        { category: "inject", name: "Sustanon ZPHC 10ML 250mg/ml", brand: "ZPHC", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "layers", desc: "Микс тестостеронов.", protocol: "250-500 мг в неделю." },
        { category: "inject", name: "Sustanon медоз 10 ml 250 mg", brand: "Medoz", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "layers", desc: "Сустанон от Medoz.", protocol: "250-500 мг в неделю." },
        { category: "inject", name: "Boldenone 10ml 250mg/ml", brand: "ZPHC", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Для аппетита и выносливости.", protocol: "600-800 мг в неделю." },
        { category: "inject", name: "Winstr S 10ml 50mg/ml", brand: "ZPHC", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Станозолол для жесткости.", protocol: "50 мг через день." },
        { category: "oral", name: "Oxy 50 мг /100tab", brand: "ZPHC", price: 82, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Мощнейший оральный препарат.", protocol: "50-100 мг в день." },
        { category: "oral", name: "Metan 10mg/100tab", brand: "SciPharmaTech", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Классика массы.", protocol: "30-50 мг в день." },
        { category: "oral", name: "Provi 25mg/ 30 tab", brand: "SciPharmaTech", price: 37, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Для снижения ГСПГ и либидо.", protocol: "25-50 мг в день." },
        { category: "oral", name: "Stan 10mg/100tab", brand: "Medil/Kubera", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Станозолол для сушки.", protocol: "30-40 мг в день." },
        { category: "oral", name: "Oxand 10mg/100tab", brand: "Medil/Kubera", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Мягкий препарат для рельефа.", protocol: "40-60 мг в день." },
        { category: "oral", name: "Turik 10mg/100tab", brand: "Medil/Kubera", price: 63, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Чистая сила и мышцы.", protocol: "40-50 мг в день." },
        { category: "oral", name: "Клен 40mg/100tab", brand: "Medil/Kubera", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Жиросжигатель.", protocol: "20-120 мкг по схеме." },
        { category: "oral", name: "Кломид 50mg/100tab", brand: "Medil/Kubera", price: 67, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Для восстановления после курса.", protocol: "50-100 мг в день." },
        { category: "oral", name: "Летрозол 2,5 mg/100tab", brand: "Medil/Kubera", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Ингибитор ароматазы.", protocol: "2.5 мг раз в 2-3 дня." },
        { category: "peptide", name: "Гр SOMATROPIX 100 ед", brand: "Somatropix", price: 95, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Гормон роста люкс.", protocol: "3-5 ЕД в сутки." },
        { category: "peptide", name: "Семаглутид - 7 mg", brand: "Peptide", price: 130, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Для похудения.", protocol: "Раз в неделю." },
        { category: "peptide", name: "Retatrutide 5mg + KPV", brand: "Peptide", price: 80, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Жиросжигание 3.0.", protocol: "Раз в неделю." },
        { category: "peptide", name: "Tirzepatide - 10 mg", brand: "Peptide", price: 150, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Мощный контроль веса.", protocol: "Раз в неделю." },
        { category: "peptide", name: "Ганадотропин - 5.000 ME", brand: "HCG", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Для работы яичек.", protocol: "500-1000 МЕ 2 раза в неделю." },
        { category: "peptide", name: "Kisspeptin-10 - 5 mg", brand: "Peptide", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимуляция ЛГ и ФСГ.", protocol: "По схеме." },
        { category: "peptide", name: "MGF PEG - 2 mg", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Фактор роста.", protocol: "200-400 мкг после тренировки." },
        { category: "peptide", name: "CJC1295 DAC - 2 mg", brand: "Peptide", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимулятор ГР.", protocol: "1000-2000 мкг раз в неделю." },
        { category: "peptide", name: "Melanotan2 - 10 mg", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид для загара.", protocol: "100-500 мкг в день." },
        { category: "peptide", name: "BPC-157 - 10 mg", brand: "Peptide", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Заживление связок.", protocol: "250-500 мкг 2 раза в день." },
        { category: "peptide", name: "TB-500 - 5 mg", brand: "Peptide", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Регенерация тканей.", protocol: "2-5 мг в неделю." },
        { category: "peptide", name: "Selank - 10 mg", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Ноотроп.", protocol: "Интраназально." },
        { category: "peptide", name: "Ипаморелин 2 mg", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимулятор ГР.", protocol: "100-200 мкг 3 раза в день." },
        { category: "peptide", name: "GHRP 2 - 5 mg", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Мощный стимулятор ГР.", protocol: "100-150 мкг 3 раза в день." },
        { category: "peptide", name: "GHRP 6 - 5 mg", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимулятор ГР и аппетита.", protocol: "100-150 мкг 3 раза в день." },
        { category: "peptide", name: "ghk 50 мг", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид меди.", protocol: "По схеме." },
        { category: "peptide", name: "ghk спрей 80 мг", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Спрей с пептидом меди.", protocol: "1-2 раза в день." }
    ];
    db.ref('products').set(null).then(() => {
        const promises = fullList.map(p => db.ref('products').push(p));
        Promise.all(promises).then(() => {
            alert("Готово!");
            location.reload();
        });
    });
};

// --- ADMIN ORDERS FUNCTIONS ---
function renderAdminOrders() {
    const list = document.getElementById('admin-orders-list');
    if (!list) return;
    
    const filteredOrders = activeOrderFilter === 'all' ? orders : orders.filter(o => o.status === activeOrderFilter);
    
    if (filteredOrders.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-gray-500">Заказов пока нет</div>`;
        return;
    }
    
    list.innerHTML = filteredOrders.map(o => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/5">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="text-white font-bold text-sm mb-1">Заказ #${o.id}</h4>
                    <p class="text-gray-400 text-xs">👤 ${o.userName} (@${o.userUsername})</p>
                    <p class="text-[#FFB800] text-xs font-bold">💰 $${o.total}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full ${
                    o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                    o.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 
                    'bg-red-500/20 text-red-400'
                }">
                    ${o.status === 'pending' ? '🕐 Новый' : o.status === 'accepted' ? '✅ Принят' : '❌ Отклонен'}
                </span>
            </div>
            
            <div class="text-xs text-gray-500 mb-3">
                📦 ${o.items.length} товар(ов) • ⏰ ${new Date(o.timestamp).toLocaleString()}
            </div>
            
            <div class="flex gap-2">
                ${o.userUsername || o.userId ? `
                    <button onclick="openBotChat('${o.userId || o.userUsername}', '${o.id}')" 
                            class="flex-1 bg-blue-500/10 text-blue-400 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-colors">
                        <i data-lucide="message-circle" class="w-3 h-3"></i>
                        Написать в боте
                    </button>
                ` : ''}
                
                ${o.status === 'pending' ? `
                    <button onclick="updateOrderStatus('${o.id}', 'accepted')" 
                            class="flex-1 bg-green-500/10 text-green-400 py-2 px-3 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors">
                        ✅ Принять
                    </button>
                    <button onclick="updateOrderStatus('${o.id}', 'rejected')" 
                            class="flex-1 bg-red-500/10 text-red-400 py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">
                        ❌ Отклонить
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function switchAdminTab(tab) {
    // Hide all sections
    document.getElementById('admin-products-section').classList.add('hidden');
    document.getElementById('admin-orders-section').classList.add('hidden');
    
    // Show selected section
    document.getElementById(`admin-${tab}-section`).classList.remove('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('text-[#FFB800]', 'active');
        btn.classList.add('text-gray-500');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-500');
        activeBtn.classList.add('text-[#FFB800]', 'active');
    }
    
    if (tab === 'orders') {
        renderAdminOrders();
    }
}

function filterOrders(filter) {
    activeOrderFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.classList.remove('bg-[#FFB800]/10', 'text-[#FFB800]', 'active');
        btn.classList.add('bg-white/5', 'text-gray-400');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white/5', 'text-gray-400');
        activeBtn.classList.add('bg-[#FFB800]/10', 'text-[#FFB800]', 'active');
    }
    
    renderAdminOrders();
}

function updateOrderStatus(orderId, status) {
    db.ref('orders/' + orderId).update({ status: status }).then(() => {
        safeAlert(`Заказ ${orderId} ${status === 'accepted' ? 'принят' : 'отклонен'}!`);
    });
}

function openBotChat(userId, orderId) {
    // Открываем бота с параметром для начала чата
    const botUsername = 'YOUR_BOT_USERNAME'; // Замените на username вашего бота (без @)
    const deepLink = `https://t.me/${botUsername}?start=chat_${userId}_${orderId}`;
    
    safeHaptic('light');
    
    // Открываем бота с параметрами чата
    tg.openTelegramLink(deepLink);
    
    safeAlert('Открываем чат в боте...');
}

// --- CLIENT NOTIFICATIONS ---
function loadClientNotifications() {
    const user = tg.initDataUnsafe?.user;
    if (!user) return;
    
    db.ref(`client_notifications/${user.id}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(key => {
                const notification = data[key];
                if (!notification.shown) {
                    safeAlert(notification.message);
                    db.ref(`client_notifications/${user.id}/${key}`).update({ shown: true });
                }
            });
        }
    });
}

// Загружаем уведомления для клиента
loadClientNotifications();

loadProducts();
