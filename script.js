const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Initialize Lucide Icons
lucide.createIcons();

// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://neonapp-a05b0-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const products = [
    // Инъекции
    { id: 1, category: 'inject', name: "Test Undecanoate", brand: "Magnus Pharmaceuticals", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", cert: "https://i.imgur.com/rP6Z6mU.jpg", icon: "droplet", desc: "Инъекционный тестостерон пролонгированного действия. Способствует набору сухой мышечной массы, увеличивает силовые показатели и поддерживает высокую работоспособность. Фармацевтическое качество (GMP).", protocol: "Концентрация: 250mg/ml. Раствор для инъекций 10ml VIAL. Производитель: Magnus Pharmaceuticals (EU)." },
    { id: 2, category: 'inject', name: "DHB Cypionate", brand: "ZPHC", price: 80, image: "assets/img/photo_2026-05-03_13-46-28.jpg", cert: "https://i.imgur.com/vHqYmXz.jpg", icon: "droplet", desc: "Дигидроболденон ципионат 100 мг/мл в ампулах. Мощный анаболик.", protocol: "100-200мг в неделю." },
    { id: 3, category: 'inject', name: "Test Enanthate", brand: "ZPHC", price: 48, image: "assets/img/photo_2026-05-03_13-46-28.jpg", cert: "https://i.imgur.com/w9K8R0A.jpg", icon: "droplet", desc: "Тестостерон энантат 10мл 250мг/мл. Классика для массонабора.", protocol: "250-500мг в неделю." },
    { id: 4, category: 'inject', name: "Test Cypionate", brand: "ZPHC", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Тестостерон ципионат 10мл 250мг/мл. Популярный эфир в США.", protocol: "250-500мг в неделю." },
    { id: 5, category: 'inject', name: "Test Propionate", brand: "ZPHC", price: 32, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Тестостерон пропионат 10мл 100мг/ml. Короткий эфир для сушки.", protocol: "100мг через день." },
    { id: 6, category: 'inject', name: "TriTren", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Смесь трех эфиров тренболона 10мл 150 мг/мл.", protocol: "150-300мг в неделю." },
    { id: 7, category: 'inject', name: "Tren Enanthate", brand: "ZPHC", price: 73, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Тренболон энантат 10мл 200мг/мл. Для экстремальной массы.", protocol: "200-400мг в неделю." },
    { id: 8, category: 'inject', name: "Tren Hexa", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Тренболон гексагидробензилкарбонат 10мл 100мг/мл.", protocol: "100-200мг в неделю." },
    { id: 9, category: 'inject', name: "Tren Acetate", brand: "ZPHC", price: 48, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "activity", desc: "Тренболон ацетат 10мл 100мг/мл. Самый мощный короткий эфир.", protocol: "100мг через день." },
    { id: 10, category: 'inject', name: "Primobolan", brand: "Balkan", price: 100, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "shield", desc: "Метенолон энантат 100мг/мл. 10 ампул по 1мл. Элитный анаболик.", protocol: "300-600мг в неделю." },
    { id: 11, category: 'inject', name: "Mast Enanthate", brand: "ZPHC", price: 100, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Дростанолон энантат 10мл 200мг. Для плотности мышц.", protocol: "200-400мг в неделю." },
    { id: 12, category: 'inject', name: "Mast Propionate", brand: "ZPHC", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Дростанолон пропионат 10мл 100мг/мл. Классика перед соревнованиями.", protocol: "100мг через день." },
    { id: 13, category: 'inject', name: "Nand Phenyl", brand: "ZPHC", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Нандролон фенилпропионат 10мл 100мг/мл.", protocol: "100мг через день." },
    { id: 14, category: 'inject', name: "Nand Deca", brand: "ZPHC", price: 60, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Нандролон деканоат 10мл 250мг/мл. Золотой стандарт массы.", protocol: "250-500мг в неделю." },
    { id: 15, category: 'inject', name: "Sustanon", brand: "ZPHC", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "layers", desc: "Сустанон 10мл 250мг/мл от ZPHC. Смесь 4 эфиров.", protocol: "250-500мг в неделю." },
    { id: 16, category: 'inject', name: "Sustanon Medoz", brand: "Medoz", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "layers", desc: "Сустанон 10мл 250мг от Medoz.", protocol: "250-500мг в неделю." },
    { id: 17, category: 'inject', name: "Boldenone", brand: "ZPHC", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Болденон ундесиленат 10мл 250мг/мл.", protocol: "500-800мг в неделю." },
    { id: 18, category: 'inject', name: "Winstr S", brand: "ZPHC", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "droplet", desc: "Станозолол инъекционный 10мл 50мг/мл.", protocol: "50мг каждый день или через день." },

    // Таблетки
    { id: 19, category: 'oral', name: "Oxy", brand: "ZPHC", price: 82, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Оксиметолон 50 мг / 100 таб. Самый мощный оральный препарат.", protocol: "50-100мг в день." },
    { id: 20, category: 'oral', name: "Metan", brand: "SciPharmaTech", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Метандиенон 10мг / 100 таб. Классика массы.", protocol: "30-50мг в день." },
    { id: 21, category: 'oral', name: "Provi", brand: "SciPharmaTech", price: 37, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Провирон 25мг / 30 таб. Антиэстроген и либидо.", protocol: "25-50мг в день." },
    { id: 22, category: 'oral', name: "Stan", brand: "Medil/Kubera", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Станозолол 10мг / 100 таб. Рельеф и сила.", protocol: "30-50мг в день." },
    { id: 23, category: 'oral', name: "Oxand", brand: "Medil/Kubera", price: 70, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Оксандролон 10мг / 100 таб. Безопасная сила.", protocol: "40-60мг в день." },
    { id: 24, category: 'oral', name: "Turik", brand: "Medil/Kubera", price: 63, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Туринабол 10мг / 100 таб. Качественная масса.", protocol: "40-50мг в день." },
    { id: 25, category: 'oral', name: "Клен", brand: "Medil/Kubera", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Кленбутерол 40мкг / 100 таб. Жиросжигание.", protocol: "40-120мкг в день по схеме." },
    { id: 26, category: 'oral', name: "Кломид", brand: "Medil/Kubera", price: 67, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Кломифен 50мг / 100 таб. Идеально для ПКТ.", protocol: "50-100мг в день после курса." },
    { id: 27, category: 'oral', name: "Летрозол", brand: "Medil/Kubera", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "pill", desc: "Летрозол 2.5мг / 100 таб. Мощный антиэстроген.", protocol: "0.5-2.5мг раз в 2-3 дня." },

    // Пептиды
    { id: 28, category: 'peptide', name: "GH SOMATROPIX", brand: "Somatropix", price: 95, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Гормон роста Somatropix 100 ед. Качество люкс.", protocol: "2-5 ЕД в сутки." },
    { id: 29, category: 'peptide', name: "Семаглутид", brand: "Peptide", price: 130, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Семаглутид 7 мг. Инновация для похудения.", protocol: "По схеме от 0.25мг в неделю." },
    { id: 30, category: 'peptide', name: "Retatrutide", brand: "Peptide", price: 80, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Retatrutide 5mg + KPV. Жиросжигание 3.0.", protocol: "По рекомендации специалиста." },
    { id: 31, category: 'peptide', name: "Tirzepatide", brand: "Peptide", price: 150, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Тирзепатид 10 мг. Мощный контроль веса.", protocol: "По схеме раз в неделю." },
    { id: 32, category: 'peptide', name: "Ганадотропин", brand: "HCG", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "ХГЧ 5.000 ME. Поддержание работы яичек.", protocol: "500-1000 ME 2 раза в неделю." },
    { id: 33, category: 'peptide', name: "Kisspeptin-10", brand: "Peptide", price: 50, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Кисспептин-10 5 мг. Стимуляция ЛГ и ФСГ.", protocol: "По схеме специалиста." },
    { id: 34, category: 'peptide', name: "MGF PEG", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Механический фактор роста 2 мг.", protocol: "200-400мкг после тренировки." },
    { id: 35, category: 'peptide', name: "CJC1295 DAC", brand: "Peptide", price: 25, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид роста длительного действия 2 мг.", protocol: "1000-2000мкг в неделю." },
    { id: 36, category: 'peptide', name: "Melanotan 2", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Меланотан 2 10 мг. Идеальный загар.", protocol: "100-500мкг в день." },
    { id: 37, category: 'peptide', name: "BPC-157", brand: "Peptide", price: 45, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид для восстановления связок 10 мг.", protocol: "250-500мкг 2 раза в день." },
    { id: 38, category: 'peptide', name: "TB-500", brand: "Peptide", price: 55, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид для регенерации тканей 5 мг.", protocol: "2-5мг в неделю." },
    { id: 39, category: 'peptide', name: "Selank", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Селанк 10 мг. Ноотроп и антистресс.", protocol: "По инструкции." },
    { id: 40, category: 'peptide', name: "Ипаморелин", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид роста без аппетита 2 мг.", protocol: "100-200мкг 3 раза в день." },
    { id: 41, category: 'peptide', name: "GHRP-2", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимулятор гормона роста 5 мг.", protocol: "100-150мкг 3 раза в день." },
    { id: 42, category: 'peptide', name: "GHRP-6", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Стимулятор роста и аппетита 5 мг.", protocol: "100-150мкг 3 раза в день." },
    { id: 43, category: 'peptide', name: "ghk", brand: "Peptide", price: 30, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид меди GHK-Cu 50 мг.", protocol: "По инструкции." },
    { id: 44, category: 'peptide', name: "ghk спрей", brand: "Peptide", price: 40, image: "assets/img/photo_2026-05-03_13-46-28.jpg", icon: "dna", desc: "Пептид меди спрей 80 мг.", protocol: "По инструкции." }
];

let cart = [];
let activeCategory = 'all';
let searchQuery = '';

// Preloader Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('loader-hidden');
    }, 2500); // 2.5 seconds to match new animation
});

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
document.getElementById('cart-btn').onclick = () => {
    openCart();
};

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
    cart.push(product);
    updateCartBadge();
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    // Animation for cart button
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartBadge();
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
                    <img src="${item.image}" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                    <i data-lucide="${item.icon}" class="hidden w-6 h-6 text-amber-500/20"></i>
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
        
        const total = cart.reduce((sum, p) => sum + p.price, 0);
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
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.brand.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 py-12 text-center opacity-40">Ничего не найдено</div>`;
        return;
    }

    grid.innerHTML = filtered.map((p, index) => `
        <div class="glass-card p-5 flex flex-col gap-4 animate-in" 
             style="animation-delay: ${index * 0.03}s"
             onclick="openProduct(${p.id})">
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="hidden absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                    <i data-lucide="${p.icon}" class="w-12 h-12 text-white/10"></i>
                </div>
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"></div>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-[10px] text-[#FFB800] font-extrabold uppercase tracking-[0.15em] opacity-80">${p.brand}</p>
                <h3 class="font-bold text-[15px] text-white leading-tight tracking-tight">${p.name}</h3>
            </div>
            <div class="flex justify-between items-center mt-auto pt-1">
                <span class="font-bold text-[18px] text-white">$${p.price}</span>
                <button onclick="event.stopPropagation(); addToCart(${p.id})" class="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/80 active:bg-[#FFB800] active:text-black transition-all">
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
    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-brand').innerText = `${currentProduct.brand} Laboratory`;
    document.getElementById('modal-price').innerText = `$${currentProduct.price}`;
    document.getElementById('modal-price-btn').innerText = `$${currentProduct.price}`;
    
    // Set Image
    const modalImageContainer = document.getElementById('modal-image-container');
    modalImageContainer.innerHTML = `
        <img src="${currentProduct.image}" class="w-full h-full object-contain p-4 opacity-90" 
             onerror="this.style.display='none'; document.getElementById('modal-placeholder-icon').style.display='block'">
        <i id="modal-placeholder-icon" data-lucide="${currentProduct.icon}" class="hidden w-24 h-24 text-amber-500/20 absolute"></i>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent pointer-events-none"></div>
    `;
    
    // Set Tab Content
    document.getElementById('tab-details').innerText = currentProduct.desc;
    document.getElementById('tab-protocol').innerText = currentProduct.protocol;
    
    // Reset Tabs
    const firstTab = document.querySelector('.tab-btn');
    switchTab('details', firstTab);

    lucide.createIcons();

    document.getElementById('product-modal').classList.add('open');
    document.getElementById('product-modal-backdrop').classList.add('opacity-100', 'pointer-events-auto');
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function switchTab(tabName, el) {
    if (!el) return;
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-white');
        btn.classList.add('text-gray-500');
    });
    el.classList.add('active', 'text-white');
    el.classList.remove('text-gray-500');

    // Update content with fade
    const tabContent = document.getElementById('tab-content');
    tabContent.style.opacity = 0;
    
    setTimeout(() => {
        document.getElementById('tab-details').classList.add('hidden');
        document.getElementById('tab-protocol').classList.add('hidden');
        
        document.getElementById('tab-' + tabName).classList.remove('hidden');
        tabContent.style.opacity = 1;
    }, 150);
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeProduct() {
    document.getElementById('product-modal').classList.remove('open');
    document.getElementById('product-modal-backdrop').classList.remove('opacity-100', 'pointer-events-auto');
}

document.getElementById('product-modal-backdrop').onclick = closeProduct;

document.getElementById('add-to-cart-btn').onclick = () => {
    cart.push(currentProduct);
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    updateMainButton();
    closeProduct();
};

function updateMainButton() {
    if (cart.length > 0) {
        const total = cart.reduce((sum, p) => sum + p.price, 0);
        tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ ($${total})`);
        tg.MainButton.show();
        tg.MainButton.onClick(handleCheckout);
        tg.MainButton.setParams({
            color: '#F59E0B',
            text_color: '#000000'
        });
    } else {
        tg.MainButton.hide();
    }
}

function handleCheckout() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    tg.showConfirm(`Подтвердить заказ на сумму $${cart.reduce((sum, p) => sum + p.price, 0)}?`, (confirmed) => {
        if (confirmed) {
            const orderId = 'OPT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            db.ref('orders/' + orderId).set({
                userId: tg.initDataUnsafe.user?.id || 'guest',
                userName: tg.initDataUnsafe.user?.first_name || 'Guest',
                items: cart,
                status: 'processing',
                total: cart.reduce((sum, p) => sum + p.price, 0),
                timestamp: Date.now()
            });

            tg.showAlert(`Заказ ${orderId} оформлен. Вы будете получать уведомления о статусе в реальном времени.`);
            cart = [];
            updateMainButton();
        }
    });
}

// Prevent Zooming
document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    let now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initial Render
renderProducts();

// Real-time updates
db.ref('orders').on('child_changed', (snapshot) => {
    const order = snapshot.val();
    if (order.userId === (tg.initDataUnsafe.user?.id || 'guest')) {
        tg.showAlert(`Статус заказа: ${order.status.toUpperCase()}`);
    }
});
