document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MƏHSULLAR (localStorage əsaslı, admin paneldən idarə olunur)
    // ==========================================
    const PRODUCTS_KEY = 'sdrtech_products';
    const CATEGORY_ICONS = {
        'Pin': '🎫', 'Oyunçu Əşyaları': '🎮', 'Oyunlar': '🕹️'
    };

    const DEFAULT_PRODUCTS = [
        { id: 1, name: "Steam Wallet 10 USD", price: 17.50, category: "Pin", image: "", bonus: 5, discountPercent: 0, stock: 50, description: "Steam cüzdanına dərhal yüklənən rəqəmsal kod.", variants: [] },
        { id: 2, name: "PUBG Mobile 660 UC", price: 16.00, category: "Pin", image: "", bonus: 4, discountPercent: 0, stock: 50, description: "PUBG Mobile hesabınıza birbaşa UC yükləməsi.", variants: [] },
        { id: 3, name: "Razer DeathAdder Essential", price: 65.00, category: "Oyunçu Əşyaları", image: "", bonus: 15, discountPercent: 0, stock: 12, description: "Ergonomik oyunçu siçanı — 6400 DPI optik sensor, 5 proqramlaşdırıla bilən düymə.", variants: [] },
        { id: 4, name: "Cyberpunk 2077 PC Key", price: 45.00, category: "Oyunlar", image: "", bonus: 10, discountPercent: 0, stock: 30, description: "Steam/GOG aktivasiya açarı.", variants: [] },
        { id: 5, name: "FIFA 25 PC Key", price: 55.00, category: "Oyunlar", image: "", bonus: 12, discountPercent: 0, stock: 30, description: "Origin/EA App aktivasiya açarı.", variants: [] },
        { id: 6, name: "GTA V PC Key", price: 25.00, category: "Oyunlar", image: "", bonus: 6, discountPercent: 10, stock: 30, description: "Rockstar Games aktivasiya açarı.", variants: [] },
        { id: 7, name: "HyperX Cloud II Qulaqlıq", price: 80.00, category: "Oyunçu Əşyaları", image: "", bonus: 18, discountPercent: 0, stock: 8, description: "7.1 Surround Sound, yaddaş köpüklü qulaqlıqlar, çıxarıla bilən mikrofon.", variants: [] },
        { id: 8, name: "Logitech G102 Mouse", price: 35.00, category: "Oyunçu Əşyaları", image: "", bonus: 8, discountPercent: 0, stock: 20, description: "RGB işıqlandırma, 8000 DPI, yüngül dizayn oyunçu siçanı.", variants: [] },
        { id: 9, name: "PlayStation Plus 1 Ay", price: 20.00, category: "Pin", image: "", bonus: 5, discountPercent: 0, stock: 40, description: "PSN hesabınıza aktivləşdirmə kodu.", variants: [] },
        { id: 10, name: "Xbox Game Pass 1 Ay", price: 22.00, category: "Pin", image: "", bonus: 5, discountPercent: 0, stock: 40, description: "Xbox/Microsoft hesabınıza aktivləşdirmə kodu.", variants: [] }
    ];

    function migrateProduct(p) {
        if (p.image === undefined) p.image = '';
        if (p.bonus === undefined) p.bonus = 0;
        if (p.discountPercent === undefined) p.discountPercent = 0;
        if (p.stock === undefined) p.stock = 50;
        if (p.description === undefined) p.description = '';
        if (p.variants === undefined) p.variants = [];
        return p;
    }
    function getProducts() {
        try {
            const saved = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
            if (!saved || !Array.isArray(saved) || saved.length === 0) {
                saveProducts(DEFAULT_PRODUCTS);
                return DEFAULT_PRODUCTS.map(migrateProduct);
            }
            return saved.map(migrateProduct);
        } catch (e) { return DEFAULT_PRODUCTS.map(migrateProduct); }
    }
    function saveProducts(list) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    }
    function getNextProductId() {
        const list = getProducts();
        return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    }
    function finalPrice(p) {
        if (p.discountPercent && p.discountPercent > 0) {
            return p.price * (1 - p.discountPercent / 100);
        }
        return p.price;
    }
    window.getProducts = getProducts;
    window.finalPrice = finalPrice;

    // ==========================================
    // 2. MƏHSULLARI YÜKLƏ (kateqoriyaya görə filtrlə)
    // ==========================================
    const productsGrid = document.getElementById('productsGrid');
    function renderProductsGrid(searchTerm) {
        if (!productsGrid) return;
        const products = getProducts();
        const pageCategory = document.body.getAttribute('data-category');
        let list = products;
        if (pageCategory === 'Endirimli') {
            list = products.filter(p => p.discountPercent > 0);
        } else if (pageCategory) {
            list = products.filter(p => p.category === pageCategory);
        }
        const term = (searchTerm || '').trim().toLowerCase();
        if (term) {
            list = list.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
        }
        renderCategoryChipRow(pageCategory, products, term);
        if (list.length === 0) {
            productsGrid.innerHTML = `<p style="color:var(--text-muted); padding:20px 0;">${term ? 'Axtarışa uyğun məhsul tapılmadı.' : 'Hazırda bu bölmədə məhsul yoxdur.'}</p>`;
            return;
        }
        productsGrid.innerHTML = list.map(item => {
            const fPrice = finalPrice(item);
            const icon = CATEGORY_ICONS[item.category] || '🛍️';
            const outOfStock = item.stock !== undefined && item.stock <= 0;
            const hasVariants = item.variants && item.variants.length > 0;
            return `
            <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" data-product-id="${item.id}">
                <div>
                    ${item.discountPercent > 0 ? `<span class="product-discount-badge">-${item.discountPercent}%</span>` : ''}
                    ${outOfStock ? `<span class="product-outofstock-badge">Tükəndi</span>` : ''}
                    <div class="product-image-wrap" data-action="quickview" data-id="${item.id}">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<span class="fallback-icon">${icon}</span>`}
                    </div>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${item.category}</span>
                    <h3 class="product-title" data-action="quickview" data-id="${item.id}" style="cursor:pointer;">${item.name}</h3>
                    ${item.bonus > 0 ? `<span class="product-bonus-badge">🎁 +${item.bonus} SDR Bonus</span>` : ''}
                </div>
                <div>
                    ${hasVariants ? `
                        <select class="variant-select" data-id="${item.id}">
                            ${item.variants.map((v, vi) => `<option value="${vi}">${v.label} — ₼${v.price.toFixed(2)}</option>`).join('')}
                        </select>
                    ` : `
                        <div class="product-price">
                            ${item.discountPercent > 0 ? `<span class="product-price-old">₼${item.price.toFixed(2)}</span>` : ''}
                            ₼${fPrice.toFixed(2)}
                        </div>
                    `}
                    <button class="btn btn-outline btn-block quickview-trigger-btn" style="margin-top:8px;" data-action="quickview" data-id="${item.id}">🔍 Ətraflı bax</button>
                    ${outOfStock
                        ? `<button class="btn btn-block" style="margin-top:8px; opacity:0.5; cursor:not-allowed;" disabled>Tükəndi</button>`
                        : `<button class="btn btn-primary btn-block" style="margin-top:8px;" data-action="add-to-cart" data-id="${item.id}">+ Səbətə At</button>`
                    }
                </div>
            </div>
        `;
        }).join('');
    }
    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            const addBtn = e.target.closest('[data-action="add-to-cart"]');
            if (addBtn) {
                const id = parseInt(addBtn.getAttribute('data-id'), 10);
                const card = addBtn.closest('.product-card');
                const variantSelect = card ? card.querySelector('.variant-select') : null;
                const variantIndex = variantSelect ? parseInt(variantSelect.value, 10) : null;
                window.addToCart(id, variantIndex);
                return;
            }
            const qvTrigger = e.target.closest('[data-action="quickview"]');
            if (qvTrigger) {
                const id = parseInt(qvTrigger.getAttribute('data-id'), 10);
                openQuickView(id);
            }
        });
    }

    // ---- Kateqoriya/Oyun ikon zolağı (feature: sol menyu ikonları -> üfüqi çip zolağı) ----
    function renderCategoryChipRow(pageCategory, allProducts, activeTerm) {
        const grid = document.getElementById('productsGrid');
        if (!grid || !pageCategory || pageCategory === 'Endirimli') {
            const existing = document.getElementById('categoryChipRow');
            if (existing) existing.remove();
            return;
        }
        const items = allProducts.filter(p => p.category === pageCategory);
        let row = document.getElementById('categoryChipRow');
        if (!row) {
            row = document.createElement('div');
            row.id = 'categoryChipRow';
            row.className = 'category-chip-row';
            grid.parentNode.insertBefore(row, grid);
        }
        const icon = CATEGORY_ICONS[pageCategory] || '🛍️';
        row.innerHTML = `
            <button class="category-chip ${!activeTerm ? 'active' : ''}" data-chip-term="">Hamısı</button>
            ${items.map(p => `
                <button class="category-chip" data-chip-term="${p.name}">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<span class="category-chip-icon">${icon}</span>`}
                    <span>${p.name}</span>
                </button>
            `).join('')}
        `;
        row.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const term = chip.getAttribute('data-chip-term');
                if (searchInputEl) searchInputEl.value = term;
                renderProductsGrid(term);
            });
        });
    }

    // ---- Quick View Modal (dinamik yaradılır) ----
    function ensureQuickViewModal() {
        let modal = document.getElementById('quickViewModal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'quickViewModal';
        modal.innerHTML = `
            <div class="modal-box quickview-box">
                <button class="modal-close" id="closeQuickViewBtn">&times;</button>
                <div id="quickViewContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeQuickView(); });
        document.getElementById('closeQuickViewBtn').addEventListener('click', closeQuickView);
        return modal;
    }
    function closeQuickView() {
        const modal = document.getElementById('quickViewModal');
        if (modal) modal.classList.remove('active');
    }
    function openQuickView(id) {
        const item = getProducts().find(p => p.id === id);
        if (!item) return;
        const modal = ensureQuickViewModal();
        const content = document.getElementById('quickViewContent');
        const fPrice = finalPrice(item);
        const icon = CATEGORY_ICONS[item.category] || '🛍️';
        const outOfStock = item.stock !== undefined && item.stock <= 0;
        const hasVariants = item.variants && item.variants.length > 0;
        content.innerHTML = `
            <div class="quickview-image-wrap">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<span class="fallback-icon" style="font-size:4rem;">${icon}</span>`}
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">${item.category}</span>
            <h2 style="margin:6px 0 10px;">${item.name}</h2>
            ${item.description ? `<p style="color:var(--text-muted); line-height:1.7; margin-bottom:12px; white-space:pre-line;">${item.description}</p>` : ''}
            <div style="margin-bottom:10px;">
                ${outOfStock
                    ? `<span class="badge badge-blocked">Stokda yoxdur</span>`
                    : `<span class="badge badge-active">Stokda: ${item.stock !== undefined ? item.stock : '∞'} ədəd</span>`
                }
                ${item.bonus > 0 ? ` <span class="product-bonus-badge">🎁 +${item.bonus} SDR Bonus</span>` : ''}
            </div>
            ${hasVariants ? `
                <select class="variant-select" id="quickViewVariantSelect" style="width:100%; margin-bottom:12px;">
                    ${item.variants.map((v, vi) => `<option value="${vi}">${v.label} — ₼${v.price.toFixed(2)}</option>`).join('')}
                </select>
            ` : `
                <div class="product-price" style="font-size:1.4rem; margin-bottom:12px;">
                    ${item.discountPercent > 0 ? `<span class="product-price-old">₼${item.price.toFixed(2)}</span>` : ''}
                    ₼${fPrice.toFixed(2)}
                </div>
            `}
            ${outOfStock
                ? `<button class="btn btn-block" style="opacity:0.5; cursor:not-allowed;" disabled>Tükəndi</button>`
                : `<button class="btn btn-primary btn-block" id="quickViewAddBtn">+ Səbətə At</button>`
            }
        `;
        const addBtn = document.getElementById('quickViewAddBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const variantSelect = document.getElementById('quickViewVariantSelect');
                const variantIndex = variantSelect ? parseInt(variantSelect.value, 10) : null;
                window.addToCart(id, variantIndex);
                closeQuickView();
            });
        }
        modal.classList.add('active');
    }
    renderProductsGrid();

    // ==========================================
    // 2b. AXTARIŞ (canlı, saytın hər yerindən işləyir)
    // ==========================================
    const CATEGORY_PAGE_MAP = {
        'Oyunlar': 'oyunlar.html',
        'Oyunçu Əşyaları': 'avadanliqlar.html',
        'Pin': 'pinler.html'
    };
    const searchInputEl = document.getElementById('searchInput');
    const searchBtnEl = document.querySelector('.search-btn');
    const searchBoxEl = document.querySelector('.search-box');
    let searchDropdownEl = null;

    function ensureSearchDropdown() {
        if (!searchBoxEl) return null;
        if (!searchDropdownEl) {
            searchDropdownEl = document.createElement('div');
            searchDropdownEl.className = 'search-results-dropdown';
            searchBoxEl.appendChild(searchDropdownEl);
        }
        return searchDropdownEl;
    }

    function goToProduct(product) {
        const targetPage = CATEGORY_PAGE_MAP[product.category] || 'index.html';
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === targetPage) {
            if (searchDropdownEl) searchDropdownEl.classList.remove('active');
            renderProductsGrid('');
            if (searchInputEl) searchInputEl.value = '';
            highlightProductCard(product.id);
        } else {
            window.location.href = `${targetPage}?productId=${product.id}`;
        }
    }

    function highlightProductCard(id) {
        setTimeout(() => {
            const card = document.querySelector(`.product-card[data-product-id="${id}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('search-highlight-card');
                setTimeout(() => card.classList.remove('search-highlight-card'), 2200);
            }
        }, 150);
    }

    function renderSearchDropdown(term) {
        const dropdown = ensureSearchDropdown();
        if (!dropdown) return;
        const clean = term.trim().toLowerCase();
        if (!clean) { dropdown.classList.remove('active'); dropdown.innerHTML = ''; return; }
        const matches = getProducts().filter(p =>
            p.name.toLowerCase().includes(clean) || p.category.toLowerCase().includes(clean)
        ).slice(0, 8);

        if (matches.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">Nəticə tapılmadı: "${term}"</div>`;
        } else {
            dropdown.innerHTML = matches.map(p => {
                const icon = CATEGORY_ICONS[p.category] || '🛍️';
                return `
                    <div class="search-result-item" data-id="${p.id}">
                        <div class="search-result-thumb">${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : icon}</div>
                        <div class="search-result-info">
                            <div class="search-result-name">${p.name}</div>
                            <div class="search-result-cat">${p.category} · ₼${finalPrice(p).toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        dropdown.classList.add('active');
    }

    if (searchInputEl) {
        searchInputEl.addEventListener('input', () => {
            const term = searchInputEl.value;
            renderSearchDropdown(term);
            if (productsGrid) renderProductsGrid(term);
        });
        searchInputEl.addEventListener('focus', () => {
            if (searchInputEl.value.trim()) renderSearchDropdown(searchInputEl.value);
        });
        searchInputEl.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const term = searchInputEl.value.trim();
            if (!term) return;
            const matches = getProducts().filter(p =>
                p.name.toLowerCase().includes(term.toLowerCase()) || p.category.toLowerCase().includes(term.toLowerCase())
            );
            if (matches.length > 0) {
                goToProduct(matches[0]);
            } else if (productsGrid) {
                renderProductsGrid(term);
                if (searchDropdownEl) searchDropdownEl.classList.remove('active');
            }
        });
    }
    if (searchBtnEl && searchInputEl) {
        searchBtnEl.addEventListener('click', () => {
            searchInputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
    }
    if (searchDropdownEl === null && searchBoxEl) ensureSearchDropdown();
    document.addEventListener('click', (e) => {
        if (searchBoxEl && !searchBoxEl.contains(e.target) && searchDropdownEl) {
            searchDropdownEl.classList.remove('active');
        }
    });
    if (searchDropdownEl) {
        searchDropdownEl.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (!item) return;
            const id = parseInt(item.getAttribute('data-id'), 10);
            const product = getProducts().find(p => p.id === id);
            if (product) goToProduct(product);
        });
    }

    // Başqa səhifədən gələn ?productId= parametrini emal et
    (function handleIncomingProductHighlight() {
        const params = new URLSearchParams(window.location.search);
        const pid = params.get('productId');
        if (pid && productsGrid) {
            highlightProductCard(parseInt(pid, 10));
        }
    })();

    // ==========================================
    // 3. DARK / LIGHT MODE
    // ==========================================
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('sdrtech_theme', nextTheme);
        });
    }
    const savedTheme = localStorage.getItem('sdrtech_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    // ==========================================
    // 4. AUTH MODAL (Giriş / Qeydiyyat / Şifrəni unutdum)
    // ==========================================
    const authModal = document.getElementById('authModal');
    const authModalBtn = document.getElementById('authModalBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotView = document.getElementById('forgotView');
    const forgotLink = document.getElementById('forgotLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const modalTabs = document.querySelector('.modal-tabs');

    function openAuthModal() {
        if (!authModal) return;
        authModal.classList.add('active');
    }
    function closeAuth() {
        if (!authModal) return;
        authModal.classList.remove('active');
    }

    if (authModalBtn) authModalBtn.addEventListener('click', openAuthModal);
    if (closeAuthModal) closeAuthModal.addEventListener('click', closeAuth);
    if (authModal) {
        authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });
    }

    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            if (forgotView) forgotView.classList.remove('active');
            if (modalTabs) modalTabs.style.display = 'flex';
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
            if (forgotView) forgotView.classList.remove('active');
            if (modalTabs) modalTabs.style.display = 'flex';
        });
    }

    if (forgotLink && forgotView && loginForm) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            forgotView.classList.add('active');
            if (modalTabs) modalTabs.style.display = 'none';
        });
    }
    if (backToLoginLink && forgotView && loginForm) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotView.classList.remove('active');
            loginForm.classList.add('active');
            if (modalTabs) modalTabs.style.display = 'flex';
            if (tabLogin && tabRegister) {
                tabLogin.classList.add('active');
                tabRegister.classList.remove('active');
            }
        });
    }

    // TELEFON XANALARI: +994 prefiksi məcburi, yalnız 9 rəqəm qəbul edir
    ['registerPhone', 'profilePhoneInput'].forEach(id => {
        const phoneEl = document.getElementById(id);
        if (!phoneEl) return;
        if (!phoneEl.value) phoneEl.value = '+994';
        phoneEl.addEventListener('focus', () => {
            if (!phoneEl.value) phoneEl.value = '+994';
        });
        phoneEl.addEventListener('input', () => {
            let digits = phoneEl.value.replace(/^\+994/, '').replace(/\D/g, '').slice(0, 9);
            phoneEl.value = '+994' + digits;
        });
        phoneEl.addEventListener('keydown', (e) => {
            const selStart = phoneEl.selectionStart;
            if ((e.key === 'Backspace' || e.key === 'Delete') && selStart <= 4) {
                e.preventDefault();
            }
        });
    });

    // ŞİFRƏ GÖSTƏR/GİZLƏT (göz düyməsi)
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // ==========================================
    // 4b. HESAB SİSTEMİ (localStorage əsaslı - demo versiya)
    // ==========================================
    const USERS_KEY = 'sdrtech_users';
    const SESSION_KEY = 'sdrtech_session';
    const ADMIN_EMAIL = 'ebilovmehemmed073@gmail.com';
    const ADMIN_PASSWORD = 'mehemmed0732009';

    // ---- Əlavə admin sistemləri üçün storage açarları ----
    const COUPONS_KEY = 'sdrtech_coupons';
    const SETTINGS_KEY = 'sdrtech_settings';
    const LOG_KEY = 'sdrtech_security_log';
    const SESSIONS_KEY = 'sdrtech_active_sessions';
    const CHATS_KEY = 'sdrtech_chats';
    const VISITOR_KEY = 'sdrtech_visitor_id';
    const CART_COUPON_KEY = 'sdrtech_cart_coupon';

    function migrateUser(u) {
        if (u.role === undefined) u.role = null;
        if (u.blocked === undefined) u.blocked = false;
        if (u.ip === undefined) u.ip = 'N/A';
        if (u.registeredAt === undefined) u.registeredAt = new Date().toLocaleDateString('az-AZ');
        if (u.sdrBonus === undefined) u.sdrBonus = 0;
        if (u.phone === undefined) u.phone = '';
        if (u.avatar === undefined) u.avatar = '';
        if (u.avatarEmoji === undefined) u.avatarEmoji = '👤';
        if (u.orders) {
            u.orders.forEach(o => {
                if (o.status === undefined) o.status = 'Gözləmədə';
                if (o.timestamp === undefined) {
                    const parts = (o.date || '').split('.');
                    o.timestamp = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || Date.now() : Date.now();
                }
            });
        }
        return u;
    }

    function getUsers() {
        try {
            const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            return list.map(migrateUser);
        }
        catch (e) { return []; }
    }
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // ---- Avatar (profil şəkli) tapılması ----
    function getAvatarHtml(email, size) {
        const s = size || 28;
        if (email) {
            const u = getUsers().find(x => x.email === email);
            if (u && u.avatar) return `<img src="${u.avatar}" class="chat-avatar-img" style="width:${s}px;height:${s}px;" alt="avatar">`;
            if (u && u.avatarEmoji) return `<span class="chat-avatar-emoji" style="font-size:${s * 0.65}px;">${u.avatarEmoji}</span>`;
        }
        return `<span class="chat-avatar-emoji" style="font-size:${s * 0.65}px;">👤</span>`;
    }
    window.getAvatarHtml = getAvatarHtml;

    // ---- Promokodlar ----
    function getCoupons() {
        try { return JSON.parse(localStorage.getItem(COUPONS_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveCoupons(list) {
        localStorage.setItem(COUPONS_KEY, JSON.stringify(list));
    }

    // ---- Bonus Kampaniya Çarpanı ----
    const BONUS_MULTIPLIER_KEY = 'sdrtech_bonus_multiplier';
    function getBonusMultiplier() {
        const v = parseFloat(localStorage.getItem(BONUS_MULTIPLIER_KEY));
        return isNaN(v) || v <= 0 ? 1 : v;
    }
    function saveBonusMultiplier(v) {
        localStorage.setItem(BONUS_MULTIPLIER_KEY, String(v));
    }

    // ---- Balans Artırma Sorğuları (m10 qəbz təsdiqi) ----
    const TOPUPS_KEY = 'sdrtech_topups';
    function getTopups() {
        try { return JSON.parse(localStorage.getItem(TOPUPS_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveTopups(list) {
        localStorage.setItem(TOPUPS_KEY, JSON.stringify(list));
    }

    // ---- Canlı Dəstək Reytinqləri ----
    const RATINGS_KEY = 'sdrtech_chat_ratings';
    function getRatings() {
        try { return JSON.parse(localStorage.getItem(RATINGS_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveRatings(list) {
        localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
    }

    // ---- Sayt Parametrləri ----
    const DEFAULT_SETTINGS = {
        logoText: 'SDR TECH',
        siteTitle: 'SDR TECH',
        phone: '',
        social: { instagram: '', tiktok: '', discord: '', x: '' },
        chatEnabled: true,
        termsText: 'SDR TECH platformasından istifadə etməklə aşağıdakı qaydaları qəbul etmiş olursunuz:\n\n1. Bütün satışlar rəqəmsal məhsullardır və geri qaytarılmır.\n2. Balans artırma yalnız təsdiqlənmiş m10 qəbzləri əsasında həyata keçirilir.\n3. Hesabınızın təhlükəsizliyinə görə siz məsuliyyət daşıyırsınız.\n4. SDR Bonus xalları yalnız SDR TECH daxilində istifadə oluna bilər.\n5. Admin qaydaları pozan hesabları bloklama hüququnu özündə saxlayır.'
    };
    function getSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            if (!saved) return { ...DEFAULT_SETTINGS, social: { ...DEFAULT_SETTINGS.social } };
            return { ...DEFAULT_SETTINGS, ...saved, social: { ...DEFAULT_SETTINGS.social, ...(saved.social || {}) } };
        } catch (e) { return { ...DEFAULT_SETTINGS, social: { ...DEFAULT_SETTINGS.social } }; }
    }
    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    function applySettings() {
        const settings = getSettings();

        // Loqotip
        const logoLink = document.getElementById('siteLogoLink');
        if (logoLink && settings.logoText) {
            const parts = settings.logoText.trim().split(' ');
            logoLink.innerHTML = parts.length > 1
                ? `${parts[0]} <span>${parts.slice(1).join(' ')}</span>`
                : settings.logoText;
        }

        // Sayt başlığı
        if (settings.siteTitle && settings.siteTitle !== 'SDR TECH') {
            document.title = document.title.replace(/SDR TECH/g, settings.siteTitle);
        }

        // Sosial media linkləri
        const socialMap = {
            socialInstagram: settings.social.instagram,
            socialTiktok: settings.social.tiktok,
            socialDiscord: settings.social.discord,
            socialX: settings.social.x
        };
        Object.keys(socialMap).forEach(id => {
            const el = document.getElementById(id);
            if (el && socialMap[id]) {
                el.setAttribute('href', socialMap[id]);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
        });

        // Əlaqə nömrəsi
        const contactPhoneBox = document.getElementById('contactPhoneBox');
        if (contactPhoneBox && settings.phone) {
            contactPhoneBox.textContent = '📞 ' + settings.phone;
            contactPhoneBox.style.display = 'inline';
        }
        const footerContactLine = document.getElementById('footerContactLine');
        if (footerContactLine && settings.phone) {
            footerContactLine.textContent = '📞 Əlaqə: ' + settings.phone;
            footerContactLine.style.display = 'block';
        }

        // Canlı dəstək vidgetinin aktivliyi
        const chatWidget = document.querySelector('.chat-widget');
        if (chatWidget && settings.chatEnabled === false) {
            chatWidget.style.display = 'none';
        }
    }
    applySettings();

    // ---- Qaydalar və Şərtlər Modalı (dinamik) ----
    function ensureTermsModal() {
        let modal = document.getElementById('termsModal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'termsModal';
        modal.innerHTML = `
            <div class="modal-box">
                <button class="modal-close" id="closeTermsModalBtn">&times;</button>
                <h3 style="margin-bottom:14px;">📜 Qaydalar və Şərtlər</h3>
                <div id="termsModalContent" style="white-space:pre-line; line-height:1.8; color:var(--text-muted); max-height:60vh; overflow-y:auto;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        document.getElementById('closeTermsModalBtn').addEventListener('click', () => modal.classList.remove('active'));
        return modal;
    }
    function openTermsModal() {
        const modal = ensureTermsModal();
        document.getElementById('termsModalContent').textContent = getSettings().termsText || '';
        modal.classList.add('active');
    }
    document.addEventListener('click', (e) => {
        if (e.target.closest('#viewTermsLink')) {
            e.preventDefault();
            openTermsModal();
        }
    });

    // ---- Sadə Toast Bildirişi ----
    window.showToast = function(message, type) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type || 'info'}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    };

    // ==========================================
    // BANNER SLIDER (Admin idarə edir)
    // ==========================================
    const BANNERS_KEY = 'sdrtech_banners';
    const DEFAULT_BANNERS = [
        { id: 1, image: 'banner.jpg', tag: 'YENİ ÇIXIŞ', title: 'Oyun Dünyasının Ən Son<br>Avadanlıqları SDR TECH-də!', subtitle: 'Oyun pini, rəqəmsal açarlar və peşəkar oyunçu aksesuarlarına dərhal sahib ol.', buttonText: 'İndi kəşf et', buttonLink: '#products' }
    ];
    function getBanners() {
        try {
            const saved = JSON.parse(localStorage.getItem(BANNERS_KEY));
            return (saved && saved.length) ? saved : DEFAULT_BANNERS;
        } catch (e) { return DEFAULT_BANNERS; }
    }
    function saveBanners(list) { localStorage.setItem(BANNERS_KEY, JSON.stringify(list)); }

    let bannerSliderTimer = null;
    function renderBannerSlider() {
        const track = document.getElementById('bannerSliderTrack');
        const dotsWrap = document.getElementById('bannerSliderDots');
        if (!track) return;
        const banners = getBanners();

        track.innerHTML = banners.map((b, i) => `
            <div class="banner-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                <div class="hero-banner-inner">
                    <div class="hero-banner-content">
                        ${b.tag ? `<span class="tag">${b.tag}</span>` : ''}
                        <h1>${b.title || ''}</h1>
                        <p>${b.subtitle || ''}</p>
                        ${b.buttonText ? `<a href="${b.buttonLink || '#products'}" class="btn btn-primary">${b.buttonText}</a>` : ''}
                    </div>
                    <div class="hero-banner-graphics">
                        <img src="${b.image}" alt="SDR TECH Banner" style="max-width:100%; height:auto;" onerror="this.style.display='none'">
                    </div>
                </div>
            </div>
        `).join('');

        if (dotsWrap) {
            dotsWrap.innerHTML = banners.map((b, i) => `<button class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`).join('');
        }

        let current = 0;
        function goToSlide(idx) {
            const slides = track.querySelectorAll('.banner-slide');
            const dots = dotsWrap ? dotsWrap.querySelectorAll('.banner-dot') : [];
            if (!slides.length) return;
            current = (idx + slides.length) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('active', i === current));
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }
        function nextSlide() { goToSlide(current + 1); }
        function prevSlide() { goToSlide(current - 1); }

        function restartAutoplay() {
            if (bannerSliderTimer) clearInterval(bannerSliderTimer);
            if (banners.length > 1) bannerSliderTimer = setInterval(nextSlide, 4000);
        }

        const prevBtn = document.getElementById('bannerPrevBtn');
        const nextBtn = document.getElementById('bannerNextBtn');
        if (prevBtn) prevBtn.onclick = () => { prevSlide(); restartAutoplay(); };
        if (nextBtn) nextBtn.onclick = () => { nextSlide(); restartAutoplay(); };
        if (dotsWrap) {
            dotsWrap.querySelectorAll('.banner-dot').forEach(dot => {
                dot.addEventListener('click', () => { goToSlide(parseInt(dot.getAttribute('data-index'), 10)); restartAutoplay(); });
            });
        }
        restartAutoplay();
    }
    renderBannerSlider();

    // ---- ADMIN: Banner idarəetməsi ----
    function renderAdminBanners() {
        const tbody = document.getElementById('bannersTableBody');
        if (!tbody) return;
        const banners = getBanners();
        tbody.innerHTML = banners.length === 0
            ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">Banner yoxdur.</td></tr>`
            : banners.map((b, i) => `
                <tr>
                    <td><img src="${b.image}" alt="" style="width:60px; height:36px; object-fit:cover; border-radius:6px;" onerror="this.style.opacity=0.2"></td>
                    <td>${(b.title || '').replace(/<br>/g, ' ')}</td>
                    <td>
                        <button class="btn btn-outline admin-action-btn" data-action="move-up" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
                        <button class="btn btn-outline admin-action-btn" data-action="move-down" data-idx="${i}" ${i === banners.length - 1 ? 'disabled' : ''}>↓</button>
                    </td>
                    <td><button class="btn btn-outline admin-action-btn" data-action="delete-banner" data-idx="${i}" style="color:#ef4444; border-color:#ef4444;">Sil</button></td>
                </tr>
            `).join('');

        tbody.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const action = btn.getAttribute('data-action');
                const list = getBanners();
                if (action === 'delete-banner') { list.splice(idx, 1); }
                else if (action === 'move-up' && idx > 0) { [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]; }
                else if (action === 'move-down' && idx < list.length - 1) { [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]]; }
                saveBanners(list);
                renderAdminBanners();
            });
        });
    }
    const addBannerForm = document.getElementById('addBannerForm');
    if (addBannerForm) {
        renderAdminBanners();
        addBannerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const image = document.getElementById('newBannerImage').value.trim();
            const tag = document.getElementById('newBannerTag').value.trim();
            const title = document.getElementById('newBannerTitle').value.trim();
            const subtitle = document.getElementById('newBannerSubtitle').value.trim();
            const buttonText = document.getElementById('newBannerButtonText').value.trim();
            const buttonLink = document.getElementById('newBannerButtonLink').value.trim();
            if (!image || !title) { if (window.showToast) showToast('Şəkil linki və başlıq mütləqdir.', 'error'); return; }
            const list = getBanners();
            list.push({ id: Date.now(), image, tag, title, subtitle, buttonText: buttonText || 'İndi kəşf et', buttonLink: buttonLink || '#products' });
            saveBanners(list);
            addBannerForm.reset();
            renderAdminBanners();
            if (window.showToast) showToast('Banner əlavə olundu.', 'success');
        });
    }

    // ==========================================
    // SƏHİFƏLƏR ARASI HAMAR KEÇİD (fade transition)
    // ==========================================
    document.body.classList.add('page-fade-in');
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank' || link.id === 'logoutBtn') return;
        if (!href.endsWith('.html')) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('page-fade-out');
            setTimeout(() => { window.location.href = href; }, 220);
        });
    });

    // ---- Təhlükəsizlik Jurnalı ----
    function getSecurityLog() {
        try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
        catch (e) { return []; }
    }
    function logSecurity(email, action, ip) {
        const log = getSecurityLog();
        log.unshift({
            email,
            action,
            ip: ip || 'N/A',
            date: new Date().toLocaleString('az-AZ')
        });
        if (log.length > 200) log.length = 200;
        localStorage.setItem(LOG_KEY, JSON.stringify(log));
    }

    // ---- Aktiv Sessiyalar ----
    function getActiveSessions() {
        try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {}; }
        catch (e) { return {}; }
    }
    function setActiveSession(email, data) {
        const sessions = getActiveSessions();
        sessions[email] = data;
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
    function removeActiveSession(email) {
        const sessions = getActiveSessions();
        delete sessions[email];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }

    // ---- IP ünvanının müəyyən edilməsi (best-effort) ----
    function fetchAndCacheIP(callback) {
        const cached = sessionStorage.getItem('sdrtech_ip_cache');
        if (cached) { callback(cached); return; }
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                const ip = data.ip || 'N/A';
                sessionStorage.setItem('sdrtech_ip_cache', ip);
                callback(ip);
            })
            .catch(() => callback('N/A'));
    }
    function getSession() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
        catch (e) { return null; }
    }
    function setSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }
    function getCurrentUserRecord() {
        const session = getSession();
        if (!session || session.isAdmin) return null;
        const users = getUsers();
        return users.find(u => u.email === session.email) || null;
    }

    function showFormError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.style.display = 'block';
    }
    function hideFormError(el) {
        if (!el) return;
        el.style.display = 'none';
    }

    const userProfileMenu = document.getElementById('userProfileMenu');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const headerUserAvatar = document.getElementById('headerUserAvatar');
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelLink = document.getElementById('adminPanelLink');
    const adminDivider = document.getElementById('adminDivider');

    function updateAuthUI() {
        const session = getSession();
        if (session) {
            if (authModalBtn) authModalBtn.style.display = 'none';
            if (userProfileMenu) userProfileMenu.style.display = 'block';
            if (userNameDisplay) userNameDisplay.textContent = session.name;
            if (headerUserAvatar) {
                headerUserAvatar.innerHTML = session.isAdmin
                    ? '<span class="chat-avatar-emoji" style="font-size:18px;">🛡️</span>'
                    : getAvatarHtml(session.email, 24);
            }
            if (adminPanelLink && adminDivider) {
                if (session.isAdmin) {
                    adminPanelLink.style.display = 'block';
                    adminDivider.style.display = 'block';
                } else {
                    adminPanelLink.style.display = 'none';
                    adminDivider.style.display = 'none';
                }
            }
        } else {
            if (authModalBtn) authModalBtn.style.display = '';
            if (userProfileMenu) userProfileMenu.style.display = 'none';
        }
    }

    if (profileDropdownBtn && profileDropdown) {
        profileDropdownBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // ---- ÇIXIŞ TƏSDİQ MODALI ----
    const logoutConfirmModal = document.getElementById('logoutConfirmModal');
    const logoutConfirmYes = document.getElementById('logoutConfirmYes');
    const logoutConfirmCancel = document.getElementById('logoutConfirmCancel');

    function openLogoutConfirm() {
        if (logoutConfirmModal) { logoutConfirmModal.classList.add('active'); return; }
        // Fallback: modal HTML tapılmadısa birbaşa çıxış et
        performLogout();
    }
    function closeLogoutConfirm() {
        if (logoutConfirmModal) logoutConfirmModal.classList.remove('active');
    }
    function performLogout() {
        const outgoingSession = getSession();
        if (outgoingSession) removeActiveSession(outgoingSession.email);
        clearSession();
        updateAuthUI();
        if (profileDropdown) profileDropdown.classList.remove('active');
        closeLogoutConfirm();
        if (document.body.getAttribute('data-page') === 'admin' || document.body.getAttribute('data-page') === 'account') {
            window.location.href = 'index.html';
        }
    }
    if (logoutConfirmYes) logoutConfirmYes.addEventListener('click', performLogout);
    if (logoutConfirmCancel) logoutConfirmCancel.addEventListener('click', closeLogoutConfirm);
    if (logoutConfirmModal) {
        logoutConfirmModal.addEventListener('click', (e) => { if (e.target === logoutConfirmModal) closeLogoutConfirm(); });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (profileDropdown) profileDropdown.classList.remove('active');
            openLogoutConfirm();
        });
    }

    // QEYDİYYAT
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const registerError = document.getElementById('registerError');
            hideFormError(registerError);

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim().toLowerCase();
            const password = document.getElementById('registerPassword').value;
            const phoneInput = document.getElementById('registerPhone');
            const phone = phoneInput ? phoneInput.value.trim() : '';

            if (!name || !email || !password) {
                showFormError(registerError, 'Zəhmət olmasa bütün xanaları doldurun.');
                return;
            }
            if (phoneInput) {
                const digitsOnly = phone.replace('+994', '').replace(/\D/g, '');
                if (!phone.startsWith('+994') || digitsOnly.length !== 9) {
                    showFormError(registerError, 'Zəhmət olmasa telefon nömrəsini düzgün formatda daxil edin (+994 XX XXX XX XX).');
                    return;
                }
            }
            const termsCheckbox = document.getElementById('registerTermsCheckbox');
            if (termsCheckbox && !termsCheckbox.checked) {
                showFormError(registerError, 'Davam etmək üçün Qaydalar və Şərtləri qəbul etməlisiniz.');
                return;
            }
            if (email === ADMIN_EMAIL) {
                showFormError(registerError, 'Bu email istifadə edilə bilməz.');
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                showFormError(registerError, 'Bu email ilə artıq hesab mövcuddur. Daxil ol bölməsindən giriş edin.');
                return;
            }

            const newUser = {
                name, email, password, phone, balance: 0, orders: [],
                role: null, blocked: false, ip: 'Yüklənir...',
                registeredAt: new Date().toLocaleDateString('az-AZ'),
                sdrBonus: 0, avatar: '', avatarEmoji: '👤'
            };
            users.push(newUser);
            saveUsers(users);
            setSession({ name, email, isAdmin: false });
            updateAuthUI();

            fetchAndCacheIP((ip) => {
                const latestUsers = getUsers();
                const idx = latestUsers.findIndex(u => u.email === email);
                if (idx !== -1) {
                    latestUsers[idx].ip = ip;
                    saveUsers(latestUsers);
                }
                setActiveSession(email, { name, email, role: 'İstifadəçi', loginAt: new Date().toLocaleString('az-AZ'), ip });
                logSecurity(email, 'Qeydiyyatdan keçdi', ip);
            });

            registerForm.reset();
            closeAuth();
        });
    }

    // GİRİŞ
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loginError = document.getElementById('loginError');
            hideFormError(loginError);

            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            // ADMIN GİRİŞİ
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                setSession({ name: 'Admin', email, isAdmin: true });
                updateAuthUI();
                fetchAndCacheIP((ip) => {
                    setActiveSession(email, { name: 'Admin', email, role: 'Admin', loginAt: new Date().toLocaleString('az-AZ'), ip });
                    logSecurity(email, 'Admin daxil oldu', ip);
                });
                loginForm.reset();
                closeAuth();
                return;
            }

            const users = getUsers();
            const match = users.find(u => u.email === email && u.password === password);
            if (!match) {
                showFormError(loginError, 'Email və ya şifrə yanlışdır.');
                return;
            }
            if (match.blocked) {
                showFormError(loginError, 'Hesabınız bloklanıb. Zəhmət olmasa dəstəklə əlaqə saxlayın.');
                return;
            }

            setSession({ name: match.name, email: match.email, isAdmin: false });
            updateAuthUI();
            fetchAndCacheIP((ip) => {
                const latestUsers = getUsers();
                const idx = latestUsers.findIndex(u => u.email === match.email);
                if (idx !== -1) {
                    latestUsers[idx].ip = ip;
                    saveUsers(latestUsers);
                }
                const roleLabel = match.role === 'moderator' ? 'Moderator' : (match.role === 'destek' ? 'Dəstək' : 'İstifadəçi');
                setActiveSession(match.email, { name: match.name, email: match.email, role: roleLabel, loginAt: new Date().toLocaleString('az-AZ'), ip });
                logSecurity(match.email, 'Daxil oldu', ip);
            });
            loginForm.reset();
            closeAuth();
        });
    }

    // ŞİFRƏNİ YENİLƏ
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const forgotError = document.getElementById('forgotError');
            const forgotSuccess = document.getElementById('forgotSuccess');
            hideFormError(forgotError);
            if (forgotSuccess) forgotSuccess.style.display = 'none';

            const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
            const name = document.getElementById('forgotName').value.trim();
            const newPassword = document.getElementById('forgotNewPassword').value;

            const users = getUsers();
            const idx = users.findIndex(u => u.email === email && u.name.toLowerCase() === name.toLowerCase());

            if (idx === -1) {
                showFormError(forgotError, 'Email və ya ad uyğun gəlmədi. Qeydiyyat zamanı istifadə etdiyiniz məlumatları yoxlayın.');
                return;
            }
            if (!newPassword || newPassword.length < 4) {
                showFormError(forgotError, 'Yeni şifrə ən azı 4 simvol olmalıdır.');
                return;
            }

            users[idx].password = newPassword;
            saveUsers(users);

            if (forgotSuccess) {
                forgotSuccess.textContent = 'Şifrəniz yeniləndi! İndi yeni şifrə ilə daxil ola bilərsiniz.';
                forgotSuccess.style.display = 'block';
            }
            forgotForm.reset();
        });
    }

    // Səhifə yükləndikdə giriş vəziyyətini yoxla
    updateAuthUI();

    // Bloklanmış istifadəçini avtomatik çıxart
    (function checkBlockedSession() {
        const session = getSession();
        if (session && !session.isAdmin) {
            const record = getUsers().find(u => u.email === session.email);
            if (record && record.blocked) {
                clearSession();
                removeActiveSession(session.email);
                updateAuthUI();
                alert('Hesabınız bloklanıb. Zəhmət olmasa dəstəklə əlaqə saxlayın.');
                if (document.body.getAttribute('data-page') === 'account') {
                    window.location.href = 'index.html';
                }
            }
        }
    })();

    // ADMIN SƏHİFƏ MÜHAFİZƏSİ
    if (document.body.getAttribute('data-page') === 'admin') {
        const session = getSession();
        if (!session || !session.isAdmin) {
            window.location.href = 'index.html';
        }
    }
    // HESAB SƏHİFƏLƏRİ MÜHAFİZƏSİ (Balans/Sifarişlər)
    if (document.body.getAttribute('data-page') === 'account') {
        const session = getSession();
        if (!session || session.isAdmin) {
            window.location.href = 'index.html';
        }
    }

    // ==========================================
    // 5. SƏBƏT SİSTEMİ (localStorage əsaslı, kənar panel)
    // ==========================================
    const CART_KEY = 'sdrtech_cart';

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSidebarTotal = document.getElementById('cartSidebarTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const couponInput = document.getElementById('couponInput');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessage = document.getElementById('couponMessage');
    const cartDiscountRow = document.getElementById('cartDiscountRow');
    const cartDiscountAmount = document.getElementById('cartDiscountAmount');

    // ---- Promokod tətbiqi ----
    function getAppliedCoupon() {
        try { return JSON.parse(localStorage.getItem(CART_COUPON_KEY)) || null; }
        catch (e) { return null; }
    }
    function setAppliedCoupon(code) {
        localStorage.setItem(CART_COUPON_KEY, JSON.stringify(code));
    }
    function clearAppliedCoupon() {
        localStorage.removeItem(CART_COUPON_KEY);
    }
    function validCouponRecord(code) {
        const coupons = getCoupons();
        const c = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase());
        if (!c) return null;
        if (c.active === false) return null;
        if (c.expiry && new Date(c.expiry) < new Date(new Date().toDateString())) return null;
        if (c.used >= c.limit) return null;
        return c;
    }

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            const code = (couponInput.value || '').trim();
            if (couponMessage) { couponMessage.style.display = 'none'; }
            if (!code) return;
            const record = validCouponRecord(code);
            if (!record) {
                if (couponMessage) {
                    couponMessage.textContent = 'Promokod etibarsız, bitib və ya limiti dolub.';
                    couponMessage.className = 'cart-message error';
                    couponMessage.style.display = 'block';
                }
                clearAppliedCoupon();
                renderCartSidebar();
                return;
            }
            setAppliedCoupon(record.code.toUpperCase());
            if (couponMessage) {
                couponMessage.textContent = `✅ "${record.code.toUpperCase()}" tətbiq olundu: -${record.percent}%`;
                couponMessage.className = 'cart-message success';
                couponMessage.style.display = 'block';
            }
            renderCartSidebar();
        });
    }

    function renderCartHeader() {
        const cart = getCart();
        const count = cart.reduce((s, i) => s + i.qty, 0);
        const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
        const cartCountEl = document.getElementById('cartCount');
        const cartTotalPriceEl = document.getElementById('cartTotalPrice');
        if (cartCountEl) cartCountEl.innerText = count;
        if (cartTotalPriceEl) cartTotalPriceEl.innerText = `₼${total.toFixed(2)}`;
    }

    function renderCartSidebar() {
        if (!cartItemsList) return;
        const cart = getCart();
        if (cart.length === 0) {
            cartItemsList.innerHTML = `<p style="color:var(--text-muted); padding:20px 0;">Səbətiniz boşdur.</p>`;
        } else {
            cartItemsList.innerHTML = cart.map(item => `
                <div class="cart-line-item">
                    <div class="cart-line-info">
                        <strong>${item.name}</strong>
                        <span>₼${item.price.toFixed(2)} x ${item.qty}</span>
                    </div>
                    <div class="cart-line-actions">
                        <button class="qty-btn" data-action="dec" data-id="${item.cartKey || item.id}">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-action="inc" data-id="${item.cartKey || item.id}">+</button>
                        <button class="remove-btn" data-action="remove" data-id="${item.cartKey || item.id}">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
        const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
        let discount = 0;
        const appliedCode = getAppliedCoupon();
        if (appliedCode) {
            const record = validCouponRecord(appliedCode);
            if (record) {
                discount = subtotal * (record.percent / 100);
            } else {
                clearAppliedCoupon();
            }
        }
        const finalTotal = Math.max(0, subtotal - discount);
        if (cartDiscountRow && cartDiscountAmount) {
            if (discount > 0) {
                cartDiscountRow.style.display = 'flex';
                cartDiscountRow.style.justifyContent = 'space-between';
                cartDiscountAmount.textContent = `-₼${discount.toFixed(2)}`;
            } else {
                cartDiscountRow.style.display = 'none';
            }
        }
        if (cartSidebarTotal) cartSidebarTotal.textContent = `₼${finalTotal.toFixed(2)}`;
    }

    window.addToCart = function(productId, variantIndex) {
        const product = getProducts().find(p => p.id === productId);
        if (!product) return;
        if (product.stock !== undefined && product.stock <= 0) return;

        let unitPrice = finalPrice(product);
        let itemName = product.name;
        let cartKey = String(productId);
        if (product.variants && product.variants.length > 0 && variantIndex !== null && !isNaN(variantIndex) && product.variants[variantIndex]) {
            const variant = product.variants[variantIndex];
            unitPrice = variant.price;
            itemName = `${product.name} (${variant.label})`;
            cartKey = `${productId}-v${variantIndex}`;
        }

        const cart = getCart();
        const existing = cart.find(i => i.cartKey === cartKey);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: product.id, cartKey, name: itemName, price: unitPrice, qty: 1, bonus: product.bonus || 0 });
        }
        saveCart(cart);
        renderCartHeader();
        renderCartSidebar();
    };

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const key = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            let cart = getCart();
            const item = cart.find(i => String(i.cartKey || i.id) === key);
            if (!item) return;

            if (action === 'inc') item.qty += 1;
            if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
            if (action === 'remove') cart = cart.filter(i => String(i.cartKey || i.id) !== key);

            saveCart(cart);
            renderCartHeader();
            renderCartSidebar();
        });
    }

    function openCart() {
        if (!cartSidebar) return;
        renderCartSidebar();
        cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
    }
    function closeCart() {
        if (!cartSidebar) return;
        cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cartMsg = document.getElementById('cartMessage');
            if (cartMsg) { cartMsg.style.display = 'none'; cartMsg.textContent = ''; }

            const session = getSession();
            if (!session || session.isAdmin) {
                if (cartMsg) {
                    cartMsg.textContent = 'Sifariş vermək üçün əvvəlcə daxil olun.';
                    cartMsg.className = 'cart-message error';
                    cartMsg.style.display = 'block';
                }
                closeCart();
                openAuthModal();
                return;
            }

            const cart = getCart();
            if (cart.length === 0) return;

            // Stok yoxlaması (səbətə əlavə olunduqdan sonra stok dəyişmiş ola bilər)
            const currentProducts = getProducts();
            for (const cartItem of cart) {
                const prod = currentProducts.find(p => p.id === cartItem.id);
                if (prod && prod.stock !== undefined && prod.stock < cartItem.qty) {
                    if (cartMsg) {
                        cartMsg.textContent = `"${prod.name}" məhsulundan kifayət qədər stok yoxdur (Stokda: ${prod.stock}).`;
                        cartMsg.className = 'cart-message error';
                        cartMsg.style.display = 'block';
                    }
                    return;
                }
            }

            const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
            let discount = 0;
            let appliedCouponRecord = null;
            const appliedCode = getAppliedCoupon();
            if (appliedCode) {
                appliedCouponRecord = validCouponRecord(appliedCode);
                if (appliedCouponRecord) discount = subtotal * (appliedCouponRecord.percent / 100);
            }
            const total = Math.max(0, subtotal - discount);

            const users = getUsers();
            const idx = users.findIndex(u => u.email === session.email);
            if (idx === -1) return;

            if (users[idx].balance < total) {
                if (cartMsg) {
                    cartMsg.textContent = `Balansınız kifayət qədər deyil (Balans: ₼${users[idx].balance.toFixed(2)}, Lazımdır: ₼${total.toFixed(2)}). Balansınızı artırın.`;
                    cartMsg.className = 'cart-message error';
                    cartMsg.style.display = 'block';
                }
                return;
            }

            const multiplier = getBonusMultiplier();
            const bonusEarned = Math.round(cart.reduce((s, i) => s + (i.bonus || 0) * i.qty, 0) * multiplier * 100) / 100;

            users[idx].balance -= total;
            users[idx].sdrBonus = (users[idx].sdrBonus || 0) + bonusEarned;
            users[idx].orders = users[idx].orders || [];
            users[idx].orders.push({
                id: 'SDR' + Date.now(),
                date: new Date().toLocaleDateString('az-AZ'),
                timestamp: Date.now(),
                items: cart,
                total: total,
                subtotal: subtotal,
                discount: discount,
                bonusEarned: bonusEarned,
                couponCode: appliedCouponRecord ? appliedCouponRecord.code.toUpperCase() : null,
                status: 'Gözləmədə'
            });
            saveUsers(users);

            // Stoku azalt
            let productsAfterOrder = getProducts();
            cart.forEach(cartItem => {
                const pIdx = productsAfterOrder.findIndex(p => p.id === cartItem.id);
                if (pIdx !== -1 && productsAfterOrder[pIdx].stock !== undefined) {
                    productsAfterOrder[pIdx].stock = Math.max(0, productsAfterOrder[pIdx].stock - cartItem.qty);
                }
            });
            saveProducts(productsAfterOrder);
            renderProductsGrid();

            if (appliedCouponRecord) {
                const coupons = getCoupons();
                const cIdx = coupons.findIndex(c => c.code.toUpperCase() === appliedCouponRecord.code.toUpperCase());
                if (cIdx !== -1) {
                    coupons[cIdx].used = (coupons[cIdx].used || 0) + 1;
                    saveCoupons(coupons);
                }
            }

            saveCart([]);
            clearAppliedCoupon();
            if (couponInput) couponInput.value = '';
            if (couponMessage) couponMessage.style.display = 'none';
            renderCartHeader();
            renderCartSidebar();

            if (cartMsg) {
                cartMsg.textContent = bonusEarned > 0
                    ? `✅ Sifarişiniz uğurla tamamlandı! Ödəniş balansınızdan çıxıldı və 🎁 ${bonusEarned} SDR Bonus qazandınız.`
                    : '✅ Sifarişiniz uğurla tamamlandı! Ödəniş balansınızdan çıxıldı.';
                cartMsg.className = 'cart-message success';
                cartMsg.style.display = 'block';
            }
        });
    }

    renderCartHeader();

    // ==========================================
    // 6. LIVE CHAT (localStorage əsaslı, admin panelə bağlı)
    // ==========================================
    function getChats() {
        try { return JSON.parse(localStorage.getItem(CHATS_KEY)) || {}; }
        catch (e) { return {}; }
    }
    function saveChats(chats) {
        localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    }
    function getVisitorId() {
        let vid = localStorage.getItem(VISITOR_KEY);
        if (!vid) {
            vid = 'qonaq_' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(VISITOR_KEY, vid);
        }
        return vid;
    }
    function getCurrentThreadKey() {
        const session = getSession();
        if (session && !session.isAdmin) return session.email;
        return getVisitorId();
    }
    function getOrCreateThread(key) {
        const chats = getChats();
        if (!chats[key]) {
            const session = getSession();
            const isGuest = key.startsWith('qonaq_');
            chats[key] = {
                name: (session && !session.isAdmin) ? session.name : (isGuest ? 'Qonaq İstifadəçi' : key),
                email: isGuest ? null : key,
                messages: [],
                archived: false,
                lastReadByAdmin: 0,
                updatedAt: Date.now()
            };
            saveChats(chats);
        }
        return chats[key];
    }
    function pushMessageToThread(key, from, text) {
        const chats = getChats();
        if (!chats[key]) getOrCreateThread(key);
        const freshChats = getChats();
        freshChats[key].messages.push({ from, text, time: Date.now() });
        freshChats[key].updatedAt = Date.now();
        if (freshChats[key].archived && from === 'user') freshChats[key].archived = false;
        if (from === 'user' && freshChats[key].ended && freshChats[key].ratingGiven) freshChats[key].ended = false;
        saveChats(freshChats);
        return freshChats[key];
    }

    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatBox = document.getElementById('chatBox');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatBadge = document.getElementById('chatBadge');

    function renderChatWidgetMessages() {
        if (!chatMessages) return;
        const key = getCurrentThreadKey();
        const thread = getOrCreateThread(key);
        if (thread.messages.length === 0) {
            const welcome = { from: 'admin', text: 'Xoş gəldiniz! 👋 Sizə necə kömək edə bilərik?', time: Date.now() };
            pushMessageToThread(key, 'admin', welcome.text);
        }
        const freshThread = getOrCreateThread(key);
        const session = getSession();
        const myEmail = (session && !session.isAdmin) ? session.email : null;
        chatMessages.innerHTML = freshThread.messages.map(m => {
            const type = m.from === 'user' ? 'user-msg' : 'system-msg';
            const d = new Date(m.time);
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            const avatar = m.from === 'user' ? getAvatarHtml(myEmail, 26) : `<span class="chat-avatar-emoji" style="font-size:18px;">🎧</span>`;
            return `<div class="message ${type}">${avatar}<p>${m.text}</p><span class="msg-time">${timeStr}</span></div>`;
        }).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    renderChatWidgetMessages();

    // ---- Reytinq popup-u (canlı dəstək bitdikdə) ----
    function ensureRatingPopup() {
        if (!chatBox) return null;
        let popup = document.getElementById('ratingPopupOverlay');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'ratingPopupOverlay';
            popup.className = 'rating-popup-overlay';
            popup.innerHTML = `
                <div class="rating-popup-box">
                    <h4>Söhbəti necə qiymətləndirirsiniz?</h4>
                    <div class="rating-stars" id="ratingStars">
                        ${[1,2,3,4,5].map(n => `<span data-star="${n}">★</span>`).join('')}
                    </div>
                    <textarea id="ratingComment" rows="2" placeholder="Rəyiniz (istəyə bağlı)..."></textarea>
                    <button type="button" class="btn btn-primary btn-block" id="submitRatingBtn" style="margin-top:12px;">Göndər</button>
                    <button type="button" class="btn btn-outline btn-block" id="skipRatingBtn" style="margin-top:8px;">Bağla</button>
                </div>
            `;
            chatBox.appendChild(popup);

            let selectedStars = 0;
            const starsBox = popup.querySelector('#ratingStars');
            starsBox.addEventListener('click', (e) => {
                const s = e.target.closest('span[data-star]');
                if (!s) return;
                selectedStars = parseInt(s.getAttribute('data-star'), 10);
                starsBox.querySelectorAll('span').forEach(sp => {
                    sp.classList.toggle('selected', parseInt(sp.getAttribute('data-star'), 10) <= selectedStars);
                });
            });

            popup.querySelector('#submitRatingBtn').addEventListener('click', () => {
                if (selectedStars === 0) { alert('Zəhmət olmasa ulduz seçin.'); return; }
                const key = getCurrentThreadKey();
                const comment = popup.querySelector('#ratingComment').value.trim();
                const session = getSession();
                const ratings = getRatings();
                ratings.push({
                    key, name: (session && !session.isAdmin) ? session.name : 'Qonaq',
                    rating: selectedStars, comment,
                    timestamp: Date.now(), date: new Date().toLocaleString('az-AZ')
                });
                saveRatings(ratings);
                const chats = getChats();
                if (chats[key]) { chats[key].ratingGiven = true; saveChats(chats); }
                popup.classList.remove('active');
            });
            popup.querySelector('#skipRatingBtn').addEventListener('click', () => {
                const key = getCurrentThreadKey();
                const chats = getChats();
                if (chats[key]) { chats[key].ratingGiven = true; saveChats(chats); }
                popup.classList.remove('active');
            });
        }
        return popup;
    }
    function maybeShowRatingPopup() {
        const key = getCurrentThreadKey();
        const chats = getChats();
        const thread = chats[key];
        if (thread && thread.ended && !thread.ratingGiven && thread.messages.some(m => m.from === 'user')) {
            const popup = ensureRatingPopup();
            if (popup) popup.classList.add('active');
        }
    }

    if (chatToggleBtn && chatBox) {
        chatToggleBtn.addEventListener('click', () => {
            chatBox.classList.toggle('active');
            if (chatBox.classList.contains('active')) {
                if (chatBadge) chatBadge.style.display = 'none';
                if (chatInput) chatInput.focus();
                renderChatWidgetMessages();
                maybeShowRatingPopup();
            }
        });
    }
    if (closeChatBtn && chatBox) {
        closeChatBtn.addEventListener('click', () => chatBox.classList.remove('active'));
    }
    if (chatBox) {
        setInterval(() => {
            if (chatBox.classList.contains('active')) maybeShowRatingPopup();
        }, 4000);
    }

    function appendMessage(text, type) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', type);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const session = getSession();
        const myEmail = (session && !session.isAdmin) ? session.email : null;
        const avatar = type === 'user-msg' ? getAvatarHtml(myEmail, 26) : `<span class="chat-avatar-emoji" style="font-size:18px;">🎧</span>`;
        msgDiv.innerHTML = `${avatar}<p>${text}</p><span class="msg-time">${timeStr}</span>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            const key = getCurrentThreadKey();
            pushMessageToThread(key, 'user', text);
            appendMessage(text, 'user-msg');
            chatInput.value = '';

            setTimeout(() => {
                let autoReply = "Müraciətiniz üçün təşəkkür edirik! Operatorlarımız tezliklə cavab verəcək.";
                const lower = text.toLowerCase();
                if (lower.includes('çatdırılma') || lower.includes('kuryer')) {
                    autoReply = "Çatdırılma Bakı daxilində 24 saat ərzində həyata keçirilir.";
                } else if (lower.includes('uc') || lower.includes('pubg')) {
                    autoReply = "PUBG Mobile UC yükləmələri dərhal ID hesabınıza göndərilir.";
                } else if (lower.includes('qiymət') || lower.includes('endirim')) {
                    autoReply = "Xüsusi kampaniyalarımız üçün əsas səhifədəki bannerlərə göz gəzdirə bilərsiniz!";
                } else if (lower.includes('balans')) {
                    autoReply = "Balansınızı 'Hesabım' bölməsindən Balansım səhifəsinə daxil olaraq artıra bilərsiniz.";
                } else if (lower.includes('şifrə') || lower.includes('sifre')) {
                    autoReply = "Şifrənizi unutmusunuzsa, giriş pəncərəsindəki 'Şifrəni unutmusan?' linkindən yeniləyə bilərsiniz.";
                }
                pushMessageToThread(key, 'admin', autoReply);
                appendMessage(autoReply, 'system-msg');
            }, 1000);
        });
    }

    // ==========================================
    // 7. ADMIN PANEL
    // ==========================================
    if (document.body.getAttribute('data-page') === 'admin') {

        // ---- TABLAR ----
        const adminTabs = document.getElementById('adminTabs');
        const adminHamburgerBtn = document.getElementById('adminHamburgerBtn');
        if (adminHamburgerBtn && adminTabs) {
            adminHamburgerBtn.addEventListener('click', () => {
                adminTabs.classList.toggle('offcanvas-open');
                adminHamburgerBtn.classList.toggle('open');
            });
        }
        if (adminTabs) {
            adminTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.admin-tab-btn');
                if (!btn) return;
                const tab = btn.getAttribute('data-tab');
                document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const panel = document.getElementById('tab-' + tab);
                if (panel) panel.classList.add('active');
                adminTabs.classList.remove('offcanvas-open');
                if (adminHamburgerBtn) adminHamburgerBtn.classList.remove('open');
            });
        }

        const ORDER_STATUSES = ['Gözləmədə', 'Hazırlanır', 'Göndərildi', 'Tamamlandı', 'Ləğv edildi'];

        function collectAllOrders() {
            const users = getUsers().filter(u => u.email !== ADMIN_EMAIL);
            let allOrders = [];
            users.forEach(u => {
                (u.orders || []).forEach((o, oi) => allOrders.push({ ...o, userEmail: u.email, userName: u.name, orderIndex: oi }));
            });
            return { users, allOrders };
        }

        // ---- ÜMUMİ BAXIŞ (STATS + CHARTS) ----
        let revenueChartInstance = null;
        let topProductsChartInstance = null;
        let currentChartRange = 'daily';

        function buildRevenueSeries(allOrders, range) {
            const buckets = {};
            allOrders.forEach(o => {
                const d = new Date(o.timestamp || Date.now());
                let key;
                if (range === 'daily') {
                    key = d.toLocaleDateString('az-AZ');
                } else if (range === 'weekly') {
                    const onejan = new Date(d.getFullYear(), 0, 1);
                    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                    key = `${d.getFullYear()} - ${week}-ci həftə`;
                } else {
                    key = d.toLocaleDateString('az-AZ', { month: 'short', year: 'numeric' });
                }
                buckets[key] = (buckets[key] || 0) + o.total;
            });
            const labels = Object.keys(buckets);
            return { labels, values: labels.map(l => buckets[l]) };
        }

        function renderRevenueChart(range) {
            const canvas = document.getElementById('revenueChart');
            if (!canvas || typeof Chart === 'undefined') return;
            const { allOrders } = collectAllOrders();
            const series = buildRevenueSeries(allOrders, range);
            if (revenueChartInstance) revenueChartInstance.destroy();
            revenueChartInstance = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: series.labels,
                    datasets: [{
                        label: 'Gəlir (₼)',
                        data: series.values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.15)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }

        function renderTopProductsChart() {
            const canvas = document.getElementById('topProductsChart');
            if (!canvas || typeof Chart === 'undefined') return;
            const { allOrders } = collectAllOrders();
            const counts = {};
            allOrders.forEach(o => {
                (o.items || []).forEach(item => {
                    counts[item.name] = (counts[item.name] || 0) + item.qty;
                });
            });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
            if (topProductsChartInstance) topProductsChartInstance.destroy();
            topProductsChartInstance = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: sorted.map(s => s[0]),
                    datasets: [{
                        label: 'Satılan ədəd',
                        data: sorted.map(s => s[1]),
                        backgroundColor: '#f59e0b'
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, indexAxis: 'y' }
            });
        }

        document.querySelectorAll('.chart-range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentChartRange = btn.getAttribute('data-range');
                renderRevenueChart(currentChartRange);
            });
        });

        function renderOverview() {
            const { users, allOrders } = collectAllOrders();
            const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
            const activeSessions = getActiveSessions();

            const statUsers = document.getElementById('statUsers');
            const statOrders = document.getElementById('statOrders');
            const statRevenue = document.getElementById('statRevenue');
            const statSessions = document.getElementById('statSessions');
            if (statUsers) statUsers.textContent = users.length;
            if (statOrders) statOrders.textContent = allOrders.length;
            if (statRevenue) statRevenue.textContent = `₼${totalRevenue.toFixed(2)}`;
            if (statSessions) statSessions.textContent = Object.keys(activeSessions).length;

            renderRevenueChart(currentChartRange);
            renderTopProductsChart();
        }

        // ---- İSTİFADƏÇİLƏR ----
        function roleLabel(role) {
            if (role === 'moderator') return '<span class="badge badge-role">Moderator</span>';
            if (role === 'destek') return '<span class="badge badge-role">Dəstək</span>';
            return '<span class="badge badge-muted">Yoxdur</span>';
        }

        function renderUsersTable() {
            const usersTableBody = document.getElementById('usersTableBody');
            if (!usersTableBody) return;
            const { users } = collectAllOrders();

            usersTableBody.innerHTML = users.length === 0
                ? `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:20px;">Hələ istifadəçi yoxdur.</td></tr>`
                : users.map(u => `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.phone || '-'}</td>
                        <td>₼${(u.balance || 0).toFixed(2)}</td>
                        <td>₼${(u.sdrBonus || 0).toFixed(2)}</td>
                        <td>${(u.orders || []).length}</td>
                        <td>
                            <select class="status-select" data-action="set-role" data-email="${u.email}">
                                <option value="" ${!u.role ? 'selected' : ''}>Yoxdur</option>
                                <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                <option value="destek" ${u.role === 'destek' ? 'selected' : ''}>Dəstək</option>
                            </select>
                        </td>
                        <td>${u.blocked ? '<span class="badge badge-blocked">Bloklanıb</span>' : '<span class="badge badge-active">Aktiv</span>'}</td>
                        <td>${u.registeredAt}</td>
                        <td>${u.ip}</td>
                        <td>
                            <button class="btn btn-outline admin-action-btn" data-action="add-balance" data-email="${u.email}">+ Balans</button>
                            <button class="btn btn-outline admin-action-btn" data-action="reset-balance" data-email="${u.email}">Sıfırla</button>
                            <button class="btn btn-outline admin-action-btn" data-action="add-bonus" data-email="${u.email}">+ Bonus</button>
                            <button class="btn btn-outline admin-action-btn" data-action="edit-email" data-email="${u.email}">Email</button>
                            <button class="btn btn-outline admin-action-btn" data-action="edit-phone" data-email="${u.email}">Telefon</button>
                            <button class="btn btn-outline admin-action-btn" data-action="edit-password" data-email="${u.email}">Şifrə</button>
                            <button class="btn btn-outline admin-action-btn" data-action="edit-ip" data-email="${u.email}">IP</button>
                            <button class="btn btn-outline admin-action-btn" data-action="toggle-block" data-email="${u.email}">${u.blocked ? 'Aktivləşdir' : 'Blokla'}</button>
                            <button class="btn btn-outline admin-action-btn" data-action="delete-user" data-email="${u.email}" style="color:#ef4444; border-color:#ef4444;">Sil</button>
                        </td>
                    </tr>
                `).join('');
        }

        const usersTableBody = document.getElementById('usersTableBody');
        if (usersTableBody) {
            usersTableBody.addEventListener('change', (e) => {
                const sel = e.target.closest('select[data-action="set-role"]');
                if (!sel) return;
                const email = sel.getAttribute('data-email');
                let allUsers = getUsers();
                const idx = allUsers.findIndex(u => u.email === email);
                if (idx === -1) return;
                allUsers[idx].role = sel.value || null;
                saveUsers(allUsers);
                logSecurity(ADMIN_EMAIL, `${email} üçün rol dəyişdirildi: ${sel.value || 'Yoxdur'}`);
                renderUsersTable();
            });

            usersTableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const email = btn.getAttribute('data-email');
                const action = btn.getAttribute('data-action');
                let allUsers = getUsers();
                const idx = allUsers.findIndex(u => u.email === email);
                if (idx === -1) return;

                if (action === 'add-balance') {
                    const amountStr = prompt(`${allUsers[idx].name} üçün əlavə ediləcək məbləği daxil edin (₼):`, '10');
                    const amount = parseFloat(amountStr);
                    if (!isNaN(amount) && amount > 0) {
                        allUsers[idx].balance = (allUsers[idx].balance || 0) + amount;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} balansına ₼${amount.toFixed(2)} əlavə edildi`);
                        renderUsersTable(); renderOverview();
                    }
                } else if (action === 'reset-balance') {
                    if (confirm(`${allUsers[idx].name} istifadəçisinin balansını sıfırlamaq istəyirsiniz?`)) {
                        allUsers[idx].balance = 0;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} balansı sıfırlandı`);
                        renderUsersTable();
                    }
                } else if (action === 'add-bonus') {
                    const amountStr = prompt(`${allUsers[idx].name} üçün SDR bonus məbləğini daxil edin (₼):`, '5');
                    const amount = parseFloat(amountStr);
                    if (!isNaN(amount) && amount > 0) {
                        allUsers[idx].sdrBonus = (allUsers[idx].sdrBonus || 0) + amount;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} üçün ₼${amount.toFixed(2)} SDR bonus əlavə edildi`);
                        renderUsersTable();
                    }
                } else if (action === 'edit-email') {
                    const newEmail = prompt('Yeni email ünvanı:', allUsers[idx].email);
                    if (newEmail && newEmail.trim() && newEmail.trim().toLowerCase() !== email) {
                        const clean = newEmail.trim().toLowerCase();
                        if (allUsers.some(u => u.email === clean)) {
                            alert('Bu email artıq istifadə olunur.');
                            return;
                        }
                        allUsers[idx].email = clean;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} emaili ${clean} ilə dəyişdirildi`);
                        renderUsersTable();
                    }
                } else if (action === 'edit-password') {
                    const newPass = prompt(`Cari şifrə: "${allUsers[idx].password}"\nYeni şifrəni daxil edin (dəyişmək istəmirsinizsə ləğv edin):`, allUsers[idx].password);
                    if (newPass && newPass.length >= 4) {
                        allUsers[idx].password = newPass;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} şifrəsi dəyişdirildi/sıfırlandı`);
                    }
                } else if (action === 'edit-phone') {
                    const newPhone = prompt('Telefon nömrəsi (+994 XX XXX XX XX formatında):', allUsers[idx].phone || '+994');
                    if (newPhone !== null) {
                        const trimmed = newPhone.trim();
                        const digitsOnly = trimmed.replace('+994', '').replace(/\D/g, '');
                        if (trimmed && (!trimmed.startsWith('+994') || digitsOnly.length !== 9)) {
                            alert('Düzgün format: +994 və ardınca 9 rəqəm.');
                            return;
                        }
                        allUsers[idx].phone = trimmed;
                        saveUsers(allUsers);
                        logSecurity(ADMIN_EMAIL, `${email} telefon nömrəsi dəyişdirildi`);
                        renderUsersTable();
                    }
                } else if (action === 'edit-ip') {
                    const newIp = prompt('IP ünvanı:', allUsers[idx].ip || '');
                    if (newIp !== null) {
                        allUsers[idx].ip = newIp.trim() || 'N/A';
                        saveUsers(allUsers);
                        renderUsersTable();
                    }
                } else if (action === 'toggle-block') {
                    allUsers[idx].blocked = !allUsers[idx].blocked;
                    saveUsers(allUsers);
                    if (allUsers[idx].blocked) removeActiveSession(email);
                    logSecurity(ADMIN_EMAIL, `${email} ${allUsers[idx].blocked ? 'bloklandı' : 'aktivləşdirildi'}`);
                    renderUsersTable();
                } else if (action === 'delete-user') {
                    if (confirm(`${allUsers[idx].name} (${email}) hesabını silmək istədiyinizə əminsiniz?`)) {
                        allUsers.splice(idx, 1);
                        saveUsers(allUsers);
                        removeActiveSession(email);
                        logSecurity(ADMIN_EMAIL, `${email} hesabı silindi`);
                        renderUsersTable(); renderOverview();
                    }
                }
            });
        }

        // ---- SİFARİŞLƏR ----
        function renderOrdersTable() {
            const ordersTableBody = document.getElementById('ordersTableBody');
            if (!ordersTableBody) return;
            const { allOrders } = collectAllOrders();
            allOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            ordersTableBody.innerHTML = allOrders.length === 0
                ? `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">Hələ sifariş yoxdur.</td></tr>`
                : allOrders.map(o => `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.userName} (${o.userEmail})</td>
                        <td>${o.date}</td>
                        <td>₼${o.total.toFixed(2)}</td>
                        <td>
                            <select class="status-select" data-action="set-order-status" data-email="${o.userEmail}" data-order-id="${o.id}">
                                ${ORDER_STATUSES.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </td>
                    </tr>
                `).join('');
        }

        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) {
            ordersTableBody.addEventListener('change', (e) => {
                const sel = e.target.closest('select[data-action="set-order-status"]');
                if (!sel) return;
                const email = sel.getAttribute('data-email');
                const orderId = sel.getAttribute('data-order-id');
                let allUsers = getUsers();
                const uIdx = allUsers.findIndex(u => u.email === email);
                if (uIdx === -1) return;
                const oIdx = (allUsers[uIdx].orders || []).findIndex(o => o.id === orderId);
                if (oIdx === -1) return;
                allUsers[uIdx].orders[oIdx].status = sel.value;
                saveUsers(allUsers);
                logSecurity(ADMIN_EMAIL, `${orderId} sifarişinin statusu "${sel.value}" olaraq dəyişdirildi`);
            });
        }

        // ---- PROMOKODLAR ----
        function renderCouponsTable() {
            const body = document.getElementById('couponsTableBody');
            if (!body) return;
            const coupons = getCoupons();
            body.innerHTML = coupons.length === 0
                ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">Hələ promokod yoxdur.</td></tr>`
                : coupons.map((c, i) => `
                    <tr>
                        <td>${c.code.toUpperCase()}</td>
                        <td>%${c.percent}</td>
                        <td>${c.used || 0} / ${c.limit}</td>
                        <td>${c.expiry || '-'}</td>
                        <td>${c.active === false ? '<span class="badge badge-blocked">Deaktiv</span>' : '<span class="badge badge-active">Aktiv</span>'}</td>
                        <td>
                            <button class="btn btn-outline admin-action-btn" data-action="toggle-coupon" data-index="${i}">${c.active === false ? 'Aktivləşdir' : 'Deaktiv et'}</button>
                            <button class="btn btn-outline admin-action-btn" data-action="delete-coupon" data-index="${i}" style="color:#ef4444; border-color:#ef4444;">Sil</button>
                        </td>
                    </tr>
                `).join('');
        }

        const couponForm = document.getElementById('couponForm');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const errEl = document.getElementById('couponFormError');
                if (errEl) errEl.style.display = 'none';
                const code = document.getElementById('couponCode').value.trim();
                const percent = parseFloat(document.getElementById('couponPercent').value);
                const limit = parseInt(document.getElementById('couponLimit').value, 10);
                const expiry = document.getElementById('couponExpiry').value;

                if (!code || !percent || percent <= 0 || percent > 100 || !limit || limit <= 0 || !expiry) {
                    if (errEl) { errEl.textContent = 'Bütün xanaları düzgün doldurun.'; errEl.style.display = 'block'; }
                    return;
                }
                const coupons = getCoupons();
                if (coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
                    if (errEl) { errEl.textContent = 'Bu kod artıq mövcuddur.'; errEl.style.display = 'block'; }
                    return;
                }
                coupons.push({ code: code.toUpperCase(), percent, limit, used: 0, expiry, active: true });
                saveCoupons(coupons);
                logSecurity(ADMIN_EMAIL, `Yeni promokod yaradıldı: ${code.toUpperCase()} (%${percent})`);
                couponForm.reset();
                renderCouponsTable();
            });
        }

        const couponsTableBody = document.getElementById('couponsTableBody');
        if (couponsTableBody) {
            couponsTableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const action = btn.getAttribute('data-action');
                const coupons = getCoupons();
                if (!coupons[idx]) return;

                if (action === 'toggle-coupon') {
                    coupons[idx].active = coupons[idx].active === false ? true : false;
                    saveCoupons(coupons);
                    renderCouponsTable();
                } else if (action === 'delete-coupon') {
                    if (confirm(`"${coupons[idx].code}" promokodunu silmək istəyirsiniz?`)) {
                        coupons.splice(idx, 1);
                        saveCoupons(coupons);
                        renderCouponsTable();
                    }
                }
            });
        }

        // ---- CANLI DƏSTƏK PANELİ ----
        let activeChatKey = null;
        const chatThreadsList = document.getElementById('chatThreadsList');
        const chatThreadView = document.getElementById('chatThreadView');
        const chatUnreadFilter = document.getElementById('chatUnreadFilter');
        const chatArchivedFilter = document.getElementById('chatArchivedFilter');
        const liveChatEnabledToggle = document.getElementById('liveChatEnabledToggle');

        function isThreadUnread(thread) {
            const lastUserMsg = [...thread.messages].reverse().find(m => m.from === 'user');
            if (!lastUserMsg) return false;
            return lastUserMsg.time > (thread.lastReadByAdmin || 0);
        }

        function renderChatThreads() {
            if (!chatThreadsList) return;
            const chats = getChats();
            let entries = Object.entries(chats);
            entries = entries.filter(([key, t]) => (chatArchivedFilter && chatArchivedFilter.checked) ? t.archived : !t.archived);
            if (chatUnreadFilter && chatUnreadFilter.checked) {
                entries = entries.filter(([key, t]) => isThreadUnread(t));
            }
            entries.sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));

            if (entries.length === 0) {
                chatThreadsList.innerHTML = `<p style="color:var(--text-muted); padding:16px;">Söhbət yoxdur.</p>`;
                return;
            }

            chatThreadsList.innerHTML = entries.map(([key, t]) => {
                const lastMsg = t.messages[t.messages.length - 1];
                const unread = isThreadUnread(t);
                return `
                    <div class="admin-chat-thread-item ${activeChatKey === key ? 'active' : ''}" data-key="${key}">
                        <div class="thread-name">${t.name || key}${unread ? '<span class="thread-unread-dot"></span>' : ''}</div>
                        <div class="thread-preview">${lastMsg ? lastMsg.text : ''}</div>
                    </div>
                `;
            }).join('');
        }

        function renderChatView(key) {
            if (!chatThreadView) return;
            const chats = getChats();
            const thread = chats[key];
            if (!thread) {
                chatThreadView.innerHTML = `<p style="color:var(--text-muted); padding:20px;">Söhbət seçin.</p>`;
                return;
            }
            thread.lastReadByAdmin = Date.now();
            chats[key] = thread;
            saveChats(chats);

            chatThreadView.innerHTML = `
                <div class="admin-chat-view-header">
                    <strong>${thread.name || key}</strong>
                    <div>
                        <button class="btn btn-outline admin-action-btn chat-end-btn" id="endThreadBtn">✅ Söhbəti Bitir</button>
                        <button class="btn btn-outline admin-action-btn" id="archiveThreadBtn">${thread.archived ? 'Arxivdən çıxar' : 'Arxivləşdir'}</button>
                    </div>
                </div>
                <div class="admin-chat-messages" id="adminChatMessages">
                    ${thread.messages.map(m => {
                        const d = new Date(m.time);
                        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                        const avatar = m.from === 'user' ? getAvatarHtml(thread.email, 26) : `<span class="chat-avatar-emoji" style="font-size:18px;">🎧</span>`;
                        return `<div class="message ${m.from === 'user' ? 'user-msg' : 'system-msg'}">${avatar}<p>${m.text}</p><span class="msg-time">${timeStr}</span></div>`;
                    }).join('')}
                </div>
                <form class="admin-chat-reply-area" id="adminChatReplyForm">
                    <input type="text" id="adminChatReplyInput" placeholder="Cavab yazın..." autocomplete="off" required>
                    <button type="submit" class="btn btn-primary">Göndər</button>
                </form>
            `;
            const msgsBox = document.getElementById('adminChatMessages');
            if (msgsBox) msgsBox.scrollTop = msgsBox.scrollHeight;

            const endBtn = document.getElementById('endThreadBtn');
            if (endBtn) {
                endBtn.addEventListener('click', () => {
                    const c = getChats();
                    if (!c[key]) return;
                    pushMessageToThread(key, 'admin', 'Söhbət operator tərəfindən bitirildi. Bizi qiymətləndirməyinizi xahiş edirik. 🙏');
                    const fresh = getChats();
                    fresh[key].ended = true;
                    fresh[key].ratingGiven = false;
                    saveChats(fresh);
                    logSecurity(ADMIN_EMAIL, `${key} ilə söhbət bitirildi`);
                    renderChatThreads();
                    renderChatView(key);
                });
            }
            const archiveBtn = document.getElementById('archiveThreadBtn');
            if (archiveBtn) {
                archiveBtn.addEventListener('click', () => {
                    const c = getChats();
                    if (!c[key]) return;
                    c[key].archived = !c[key].archived;
                    saveChats(c);
                    renderChatThreads();
                    renderChatView(key);
                });
            }
            const replyForm = document.getElementById('adminChatReplyForm');
            if (replyForm) {
                replyForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = document.getElementById('adminChatReplyInput');
                    const text = input.value.trim();
                    if (!text) return;
                    pushMessageToThread(key, 'admin', text);
                    input.value = '';
                    renderChatThreads();
                    renderChatView(key);
                });
            }
            renderChatThreads();
        }

        if (chatThreadsList) {
            chatThreadsList.addEventListener('click', (e) => {
                const item = e.target.closest('.admin-chat-thread-item');
                if (!item) return;
                activeChatKey = item.getAttribute('data-key');
                renderChatView(activeChatKey);
            });
        }
        if (chatUnreadFilter) chatUnreadFilter.addEventListener('change', renderChatThreads);
        if (chatArchivedFilter) chatArchivedFilter.addEventListener('change', renderChatThreads);

        if (liveChatEnabledToggle) {
            const settings = getSettings();
            liveChatEnabledToggle.checked = settings.chatEnabled !== false;
            liveChatEnabledToggle.addEventListener('change', () => {
                const s = getSettings();
                s.chatEnabled = liveChatEnabledToggle.checked;
                saveSettings(s);
                logSecurity(ADMIN_EMAIL, `Canlı dəstək vidgeti ${liveChatEnabledToggle.checked ? 'aktiv edildi' : 'deaktiv edildi'}`);
            });
        }

        // ---- TƏHLÜKƏSİZLİK ----
        function renderSecurityTab() {
            const sessionsBody = document.getElementById('activeSessionsBody');
            if (sessionsBody) {
                const sessions = getActiveSessions();
                const entries = Object.values(sessions);
                sessionsBody.innerHTML = entries.length === 0
                    ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">Aktiv sessiya yoxdur.</td></tr>`
                    : entries.map(s => `
                        <tr>
                            <td>${s.name} (${s.email})</td>
                            <td>${s.role}</td>
                            <td>${s.loginAt}</td>
                            <td>${s.ip}</td>
                        </tr>
                    `).join('');
            }
            const logBody = document.getElementById('securityLogBody');
            if (logBody) {
                const log = getSecurityLog();
                logBody.innerHTML = log.length === 0
                    ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">Jurnal boşdur.</td></tr>`
                    : log.slice(0, 100).map(l => `
                        <tr>
                            <td>${l.date}</td>
                            <td>${l.email}</td>
                            <td>${l.action}</td>
                            <td>${l.ip}</td>
                        </tr>
                    `).join('');
            }
        }

        // ---- PARAMETRLƏR ----
        const siteSettingsForm = document.getElementById('siteSettingsForm');
        function populateSettingsForm() {
            const settings = getSettings();
            document.getElementById('settingLogoText').value = settings.logoText || '';
            document.getElementById('settingSiteTitle').value = settings.siteTitle || '';
            document.getElementById('settingPhone').value = settings.phone || '';
            document.getElementById('settingInstagram').value = settings.social.instagram || '';
            document.getElementById('settingTiktok').value = settings.social.tiktok || '';
            document.getElementById('settingDiscord').value = settings.social.discord || '';
            document.getElementById('settingX').value = settings.social.x || '';
            const termsField = document.getElementById('settingTerms');
            if (termsField) termsField.value = settings.termsText || '';
            if (liveChatEnabledToggle) liveChatEnabledToggle.checked = settings.chatEnabled !== false;
        }
        if (siteSettingsForm) {
            populateSettingsForm();

            siteSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const termsField = document.getElementById('settingTerms');
                const newSettings = {
                    logoText: document.getElementById('settingLogoText').value.trim() || 'SDR TECH',
                    siteTitle: document.getElementById('settingSiteTitle').value.trim() || 'SDR TECH',
                    phone: document.getElementById('settingPhone').value.trim(),
                    social: {
                        instagram: document.getElementById('settingInstagram').value.trim(),
                        tiktok: document.getElementById('settingTiktok').value.trim(),
                        discord: document.getElementById('settingDiscord').value.trim(),
                        x: document.getElementById('settingX').value.trim()
                    },
                    termsText: termsField ? termsField.value : getSettings().termsText,
                    chatEnabled: getSettings().chatEnabled
                };
                saveSettings(newSettings);
                applySettings();
                logSecurity(ADMIN_EMAIL, 'Sayt parametrləri yeniləndi');
                const successEl = document.getElementById('settingsSuccess');
                if (successEl) {
                    successEl.style.display = 'block';
                    setTimeout(() => { successEl.style.display = 'none'; }, 2500);
                }
            });
        }

        // ---- MƏHSULLAR (CRUD) ----
        function renderProductsAdminTable() {
            const body = document.getElementById('productsTableBody');
            if (!body) return;
            const list = getProducts();
            body.innerHTML = list.length === 0
                ? `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">Məhsul yoxdur.</td></tr>`
                : list.map(p => `
                    <tr>
                        <td>${p.image ? `<img src="${p.image}" class="admin-product-thumb">` : (CATEGORY_ICONS[p.category] || '🛍️')}</td>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>₼${p.price.toFixed(2)}${p.discountPercent > 0 ? ` <span style="color:#ef4444;">(-${p.discountPercent}%)</span>` : ''}</td>
                        <td>${(p.stock !== undefined && p.stock <= 0) ? `<span class="badge badge-blocked">Tükəndi</span>` : (p.stock !== undefined ? p.stock : '∞')}</td>
                        <td>🎁 ${p.bonus || 0}</td>
                        <td>
                            <button class="btn btn-outline admin-action-btn" data-action="edit-product" data-id="${p.id}">Redaktə et</button>
                            <button class="btn btn-outline admin-action-btn" data-action="delete-product" data-id="${p.id}" style="color:#ef4444; border-color:#ef4444;">Sil</button>
                        </td>
                    </tr>
                `).join('');
        }

        const productForm = document.getElementById('productForm');
        const productFormError = document.getElementById('productFormError');
        const productEditIdField = document.getElementById('productEditId');
        const productImageFileInput = document.getElementById('productImageFile');
        const productFormTitle = document.getElementById('productFormTitle');
        const productFormCancelBtn = document.getElementById('productFormCancelBtn');
        let pendingProductImageDataUrl = null;

        if (productImageFileInput) {
            productImageFileInput.addEventListener('change', () => {
                const file = productImageFileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => { pendingProductImageDataUrl = reader.result; };
                reader.readAsDataURL(file);
            });
        }

        function resetProductForm() {
            if (!productForm) return;
            productForm.reset();
            productEditIdField.value = '';
            pendingProductImageDataUrl = null;
            if (productFormTitle) productFormTitle.textContent = 'Yeni Məhsul Əlavə Et';
            if (productFormCancelBtn) productFormCancelBtn.style.display = 'none';
            if (productFormError) productFormError.style.display = 'none';
        }
        if (productFormCancelBtn) productFormCancelBtn.addEventListener('click', resetProductForm);

        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (productFormError) productFormError.style.display = 'none';
                const name = document.getElementById('productName').value.trim();
                const category = document.getElementById('productCategory').value;
                const price = parseFloat(document.getElementById('productPrice').value);
                const discountPercent = parseFloat(document.getElementById('productDiscount').value) || 0;
                const bonus = parseFloat(document.getElementById('productBonus').value) || 0;
                const stockInput = document.getElementById('productStock');
                const stock = stockInput ? (parseInt(stockInput.value, 10) || 0) : 50;
                const descriptionInput = document.getElementById('productDescription');
                const description = descriptionInput ? descriptionInput.value.trim() : '';
                const variantsInput = document.getElementById('productVariants');
                const variants = variantsInput ? parseVariantsText(variantsInput.value) : [];
                const imageUrl = document.getElementById('productImageUrl').value.trim();
                const editId = productEditIdField.value ? parseInt(productEditIdField.value, 10) : null;

                if (!name || !category || isNaN(price) || price <= 0) {
                    if (productFormError) { productFormError.textContent = 'Ad, kateqoriya və qiyməti düzgün doldurun.'; productFormError.style.display = 'block'; }
                    return;
                }
                if (discountPercent < 0 || discountPercent > 95) {
                    if (productFormError) { productFormError.textContent = 'Endirim faizi 0-95 aralığında olmalıdır.'; productFormError.style.display = 'block'; }
                    return;
                }
                if (stock < 0) {
                    if (productFormError) { productFormError.textContent = 'Stok mənfi ola bilməz.'; productFormError.style.display = 'block'; }
                    return;
                }

                const finalImage = pendingProductImageDataUrl || imageUrl || '';
                let list = getProducts();

                if (editId) {
                    const idx = list.findIndex(p => p.id === editId);
                    if (idx !== -1) {
                        list[idx] = { ...list[idx], name, category, price, discountPercent, bonus, stock, description, variants, image: finalImage || list[idx].image };
                        logSecurity(ADMIN_EMAIL, `Məhsul redaktə edildi: ${name}`);
                    }
                } else {
                    list.push({ id: getNextProductId(), name, category, price, discountPercent, bonus, stock, description, variants, image: finalImage });
                    logSecurity(ADMIN_EMAIL, `Yeni məhsul əlavə edildi: ${name}`);
                }
                saveProducts(list);
                resetProductForm();
                renderProductsAdminTable();
                renderBonusAdminTable();
            });
        }

        function parseVariantsText(text) {
            return (text || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
                const parts = line.split(':');
                const price = parseFloat(parts[parts.length - 1]);
                const label = parts.slice(0, -1).join(':').trim();
                return (label && !isNaN(price)) ? { label, price } : null;
            }).filter(Boolean);
        }
        function variantsToText(variants) {
            return (variants || []).map(v => `${v.label}:${v.price}`).join('\n');
        }

        const productsTableBody = document.getElementById('productsTableBody');
        if (productsTableBody) {
            productsTableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = parseInt(btn.getAttribute('data-id'), 10);
                const action = btn.getAttribute('data-action');
                let list = getProducts();
                const item = list.find(p => p.id === id);
                if (!item) return;

                if (action === 'edit-product') {
                    document.getElementById('productName').value = item.name;
                    document.getElementById('productCategory').value = item.category;
                    document.getElementById('productPrice').value = item.price;
                    document.getElementById('productDiscount').value = item.discountPercent || 0;
                    document.getElementById('productBonus').value = item.bonus || 0;
                    const stockField = document.getElementById('productStock');
                    if (stockField) stockField.value = item.stock !== undefined ? item.stock : 50;
                    const descField = document.getElementById('productDescription');
                    if (descField) descField.value = item.description || '';
                    const variantsField = document.getElementById('productVariants');
                    if (variantsField) variantsField.value = variantsToText(item.variants);
                    document.getElementById('productImageUrl').value = item.image && !item.image.startsWith('data:') ? item.image : '';
                    productEditIdField.value = item.id;
                    pendingProductImageDataUrl = null;
                    if (productFormTitle) productFormTitle.textContent = `Redaktə: ${item.name}`;
                    if (productFormCancelBtn) productFormCancelBtn.style.display = 'inline-block';
                    productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (action === 'delete-product') {
                    if (confirm(`"${item.name}" məhsulunu silmək istəyirsiniz?`)) {
                        list = list.filter(p => p.id !== id);
                        saveProducts(list);
                        logSecurity(ADMIN_EMAIL, `Məhsul silindi: ${item.name}`);
                        renderProductsAdminTable();
                        renderBonusAdminTable();
                    }
                }
            });
        }

        // ---- BONUS İDARƏETMƏSİ ----
        function renderBonusAdminTable() {
            const body = document.getElementById('bonusTableBody');
            if (!body) return;
            const list = getProducts();
            body.innerHTML = list.length === 0
                ? `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px;">Məhsul yoxdur.</td></tr>`
                : list.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>
                            <input type="number" min="0" step="1" class="bonus-input" data-id="${p.id}" value="${p.bonus || 0}" style="width:90px; padding:6px 8px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-color);">
                            <button class="btn btn-outline admin-action-btn" data-action="save-bonus" data-id="${p.id}">Yadda saxla</button>
                        </td>
                    </tr>
                `).join('');
            const multiplierInput = document.getElementById('bonusMultiplierInput');
            if (multiplierInput) multiplierInput.value = getBonusMultiplier();
        }

        const bonusTableBody = document.getElementById('bonusTableBody');
        if (bonusTableBody) {
            bonusTableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action="save-bonus"]');
                if (!btn) return;
                const id = parseInt(btn.getAttribute('data-id'), 10);
                const input = bonusTableBody.querySelector(`input.bonus-input[data-id="${id}"]`);
                if (!input) return;
                const value = parseFloat(input.value);
                if (isNaN(value) || value < 0) return;
                let list = getProducts();
                const idx = list.findIndex(p => p.id === id);
                if (idx === -1) return;
                list[idx].bonus = value;
                saveProducts(list);
                logSecurity(ADMIN_EMAIL, `${list[idx].name} üçün bonus ${value} olaraq təyin edildi`);
                renderProductsAdminTable();
            });
        }

        const bonusMultiplierForm = document.getElementById('bonusMultiplierForm');
        if (bonusMultiplierForm) {
            bonusMultiplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const val = parseFloat(document.getElementById('bonusMultiplierInput').value);
                if (isNaN(val) || val <= 0) return;
                saveBonusMultiplier(val);
                logSecurity(ADMIN_EMAIL, `Bonus kampaniya çarpanı ${val}x olaraq təyin edildi`);
                const successEl = document.getElementById('bonusMultiplierSuccess');
                if (successEl) {
                    successEl.style.display = 'block';
                    setTimeout(() => { successEl.style.display = 'none'; }, 2000);
                }
            });
        }

        // ---- BALANS SORĞULARI (QƏBZLƏR) ----
        function renderTopupsTable() {
            const body = document.getElementById('topupsTableBody');
            if (!body) return;
            const topups = getTopups().slice().sort((a, b) => b.timestamp - a.timestamp);
            const badgeClass = { 'Gözləmədə': 'badge-pending', 'Təsdiqləndi': 'badge-approved', 'Ləğv edildi': 'badge-rejected' };
            body.innerHTML = topups.length === 0
                ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">Sorğu yoxdur.</td></tr>`
                : topups.map(t => `
                    <tr>
                        <td>${t.userName}<br><span style="color:var(--text-muted); font-size:0.78rem;">${t.userEmail}</span></td>
                        <td>₼${t.amount.toFixed(2)}</td>
                        <td>${t.date}</td>
                        <td>${t.receipt ? `<img src="${t.receipt}" class="receipt-thumb" data-full="${t.receipt}">` : '-'}</td>
                        <td><span class="${badgeClass[t.status] || 'badge-pending'}">${t.status}</span></td>
                        <td>
                            ${t.status === 'Gözləmədə' ? `
                                <button class="btn btn-outline admin-action-btn" data-action="approve-topup" data-id="${t.id}">Təsdiqlə</button>
                                <button class="btn btn-outline admin-action-btn" data-action="reject-topup" data-id="${t.id}" style="color:#ef4444; border-color:#ef4444;">Ləğv et</button>
                            ` : '-'}
                        </td>
                    </tr>
                `).join('');
        }

        const receiptModalOverlay = document.getElementById('receiptModalOverlay');
        const receiptModalImg = document.getElementById('receiptModalImg');
        const topupsTableBody = document.getElementById('topupsTableBody');
        if (topupsTableBody) {
            topupsTableBody.addEventListener('click', (e) => {
                const thumb = e.target.closest('.receipt-thumb');
                if (thumb && receiptModalOverlay && receiptModalImg) {
                    receiptModalImg.src = thumb.getAttribute('data-full');
                    receiptModalOverlay.classList.add('active');
                    return;
                }
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                const topups = getTopups();
                const idx = topups.findIndex(t => t.id === id);
                if (idx === -1) return;

                if (action === 'approve-topup') {
                    const t = topups[idx];
                    const users = getUsers();
                    const uIdx = users.findIndex(u => u.email === t.userEmail);
                    if (uIdx !== -1) {
                        users[uIdx].balance = (users[uIdx].balance || 0) + t.amount;
                        saveUsers(users);
                    }
                    topups[idx].status = 'Təsdiqləndi';
                    saveTopups(topups);
                    logSecurity(ADMIN_EMAIL, `${t.userEmail} üçün ₼${t.amount.toFixed(2)} balans sorğusu təsdiqləndi`);
                    renderTopupsTable();
                    renderUsersTable();
                    renderOverview();
                } else if (action === 'reject-topup') {
                    const reason = prompt('Ləğv etmə səbəbini daxil edin:', 'Qəbz oxunmur / məbləğ uyğun gəlmir');
                    if (reason === null) return;
                    topups[idx].status = 'Ləğv edildi';
                    topups[idx].reason = reason;
                    saveTopups(topups);
                    logSecurity(ADMIN_EMAIL, `${topups[idx].userEmail} balans sorğusu ləğv edildi: ${reason}`);
                    renderTopupsTable();
                }
            });
        }
        if (receiptModalOverlay) {
            receiptModalOverlay.addEventListener('click', () => receiptModalOverlay.classList.remove('active'));
        }

        // ---- CANLI DƏSTƏK ANALİTİKASI ----
        function renderChatAnalytics() {
            const summaryEl = document.getElementById('analyticsSummary');
            const listEl = document.getElementById('ratingsList');
            if (!summaryEl && !listEl) return;
            const ratings = getRatings().slice().sort((a, b) => b.timestamp - a.timestamp);
            const avg = ratings.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) : 0;
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="analytics-card"><div class="stat-label">Ümumi Qiymətləndirmə</div><div class="stat-value">${ratings.length}</div></div>
                    <div class="analytics-card"><div class="stat-label">Orta Bal</div><div class="stat-value">⭐ ${avg.toFixed(1)}</div></div>
                `;
            }
            if (listEl) {
                listEl.innerHTML = ratings.length === 0
                    ? `<p style="color:var(--text-muted);">Hələ qiymətləndirmə yoxdur.</p>`
                    : ratings.map(r => `
                        <div class="rating-list-item">
                            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                                <span class="rating-avatar-wrap">${getAvatarHtml(r.key && r.key.includes('@') ? r.key : null, 26)}<strong>${r.name || r.key}</strong></span>
                                <span class="stars-display">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                            </div>
                            ${r.comment ? `<p style="margin-top:6px; color:var(--text-muted);">${r.comment}</p>` : ''}
                            <div style="color:var(--text-muted); font-size:0.78rem; margin-top:4px;">${r.date}</div>
                        </div>
                    `).join('');
            }
        }

        // ---- BÖLMƏLƏRİ SIFIRLAMA (Reset) ----
        function wireResetBtn(id, confirmMsg, doReset) {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (!confirm(confirmMsg)) return;
                doReset();
            });
        }

        wireResetBtn('resetUsersBtn', 'DİQQƏT: bütün istifadəçi hesabları (balans, sifariş, bonus daxil) həmişəlik silinəcək. Davam edilsin?', () => {
            saveUsers([]);
            logSecurity(ADMIN_EMAIL, 'İstifadəçilər siyahısı sıfırlandı');
            renderUsersTable(); renderOverview();
        });

        wireResetBtn('resetOrdersBtn', 'Bütün istifadəçilərin sifariş tarixçəsi silinəcək. Davam edilsin?', () => {
            const allUsers = getUsers();
            allUsers.forEach(u => { u.orders = []; });
            saveUsers(allUsers);
            logSecurity(ADMIN_EMAIL, 'Bütün sifarişlər sıfırlandı');
            renderOrdersTable(); renderUsersTable(); renderOverview();
        });

        wireResetBtn('resetProductsBtn', 'Bütün məhsullar ilkin (default) siyahıya qaytarılacaq. Davam edilsin?', () => {
            saveProducts(DEFAULT_PRODUCTS.map(p => ({ ...p })));
            logSecurity(ADMIN_EMAIL, 'Məhsullar siyahısı sıfırlandı');
            renderProductsAdminTable(); renderBonusAdminTable();
        });

        wireResetBtn('resetBonusBtn', 'Kampaniya çarpanı 1x-ə, məhsul bonusları isə ilkin dəyərlərinə qaytarılacaq. Davam edilsin?', () => {
            saveBonusMultiplier(1);
            const defaultsById = {};
            DEFAULT_PRODUCTS.forEach(p => { defaultsById[p.id] = p.bonus; });
            const list = getProducts();
            list.forEach(p => { if (defaultsById[p.id] !== undefined) p.bonus = defaultsById[p.id]; });
            saveProducts(list);
            logSecurity(ADMIN_EMAIL, 'Bonus parametrləri sıfırlandı');
            renderBonusAdminTable(); renderProductsAdminTable();
        });

        wireResetBtn('resetTopupsBtn', 'Bütün balans artırma sorğuları (qəbzlər) silinəcək. Davam edilsin?', () => {
            saveTopups([]);
            logSecurity(ADMIN_EMAIL, 'Balans sorğuları sıfırlandı');
            renderTopupsTable();
        });

        wireResetBtn('resetCouponsBtn', 'Bütün promokodlar silinəcək. Davam edilsin?', () => {
            saveCoupons([]);
            logSecurity(ADMIN_EMAIL, 'Promokodlar sıfırlandı');
            renderCouponsTable();
        });

        wireResetBtn('resetChatBtn', 'Bütün canlı dəstək söhbətləri silinəcək. Davam edilsin?', () => {
            saveChats({});
            logSecurity(ADMIN_EMAIL, 'Canlı dəstək söhbətləri sıfırlandı');
            activeChatKey = null;
            renderChatThreads();
            if (chatThreadView) chatThreadView.innerHTML = `<p style="color:var(--text-muted); padding:20px;">Söhbət seçin.</p>`;
        });

        wireResetBtn('resetRatingsBtn', 'Bütün canlı dəstək qiymətləndirmələri silinəcək. Davam edilsin?', () => {
            saveRatings([]);
            logSecurity(ADMIN_EMAIL, 'Dəstək qiymətləndirmələri sıfırlandı');
            renderChatAnalytics();
        });

        wireResetBtn('resetSecurityLogBtn', 'Təhlükəsizlik jurnalı (audit log) təmizlənəcək. Davam edilsin?', () => {
            localStorage.setItem(LOG_KEY, JSON.stringify([]));
            logSecurity(ADMIN_EMAIL, 'Təhlükəsizlik jurnalı sıfırlandı');
            renderSecurityTab();
        });

        wireResetBtn('resetSettingsBtn', 'Sayt parametrləri (loqo, əlaqə, sosial linklər) ilkin vəziyyətinə qaytarılacaq. Davam edilsin?', () => {
            saveSettings({ ...DEFAULT_SETTINGS, social: { ...DEFAULT_SETTINGS.social } });
            applySettings();
            populateSettingsForm();
            logSecurity(ADMIN_EMAIL, 'Sayt parametrləri sıfırlandı');
        });

        // ---- İLKİN RENDER ----
        renderOverview();
        renderUsersTable();
        renderOrdersTable();
        renderCouponsTable();
        renderProductsAdminTable();
        renderBonusAdminTable();
        renderTopupsTable();
        renderChatThreads();
        renderChatAnalytics();
        renderSecurityTab();
    }

    // ==========================================
    // 8. PROFİLİM SƏHİFƏSİ
    // ==========================================
    if (document.body.getAttribute('data-page') === 'profile') {
        const session = getSession();
        if (!session || session.isAdmin) {
            window.location.href = 'index.html';
        } else {
            const users = getUsers();
            const idx = users.findIndex(u => u.email === session.email);
            const user = idx !== -1 ? users[idx] : null;

            const avatarDisplay = document.getElementById('profileAvatarDisplay');
            const nameHeading = document.getElementById('profileNameHeading');
            const emailDisplay = document.getElementById('profileEmailDisplay');
            const createdDisplay = document.getElementById('profileCreatedDisplay');
            const nameInput = document.getElementById('profileNameInput');
            const emailInput = document.getElementById('profileEmailInput');
            const phoneInput = document.getElementById('profilePhoneInput');

            function renderAvatar() {
                if (!avatarDisplay || !user) return;
                if (user.avatar) {
                    avatarDisplay.innerHTML = `<img src="${user.avatar}" class="profile-avatar-img" alt="avatar">`;
                } else {
                    avatarDisplay.textContent = user.avatarEmoji || '👤';
                }
            }

            if (user) {
                nameHeading.textContent = user.name;
                emailDisplay.textContent = user.email;
                if ('value' in createdDisplay) createdDisplay.value = user.registeredAt || ''; else createdDisplay.textContent = user.registeredAt;
                if (nameInput) nameInput.value = user.name;
                if (emailInput) emailInput.value = user.email;
                if (phoneInput) phoneInput.value = user.phone || '+994';
                const genderSelect = document.getElementById('profileGenderInput');
                if (genderSelect) genderSelect.value = user.gender || '';
                renderAvatar();

                const sidebarBalanceStat = document.getElementById('sidebarBalanceStat');
                const sidebarBonusStat = document.getElementById('sidebarBonusStat');
                if (sidebarBalanceStat) sidebarBalanceStat.textContent = `₼${(user.balance || 0).toFixed(2)}`;
                if (sidebarBonusStat) sidebarBonusStat.textContent = (user.sdrBonus || 0).toFixed(2);
            }

            const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
            if (sidebarLogoutBtn) {
                sidebarLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof openLogoutConfirm === 'function') openLogoutConfirm();
                });
            }

            document.querySelectorAll('.avatar-choice').forEach(btn => {
                btn.addEventListener('click', () => {
                    const allUsers = getUsers();
                    const i = allUsers.findIndex(u => u.email === session.email);
                    if (i === -1) return;
                    allUsers[i].avatarEmoji = btn.getAttribute('data-emoji');
                    allUsers[i].avatar = '';
                    saveUsers(allUsers);
                    user.avatar = '';
                    user.avatarEmoji = btn.getAttribute('data-emoji');
                    renderAvatar();
                });
            });

            const avatarFileInput = document.getElementById('avatarFileInput');
            const avatarUploadBtn = document.getElementById('avatarUploadBtn');
            if (avatarUploadBtn && avatarFileInput) {
                avatarUploadBtn.addEventListener('click', () => avatarFileInput.click());
                avatarFileInput.addEventListener('change', () => {
                    const file = avatarFileInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        const allUsers = getUsers();
                        const i = allUsers.findIndex(u => u.email === session.email);
                        if (i === -1) return;
                        allUsers[i].avatar = reader.result;
                        saveUsers(allUsers);
                        user.avatar = reader.result;
                        renderAvatar();
                    };
                    reader.readAsDataURL(file);
                });
            }

            const profileForm = document.getElementById('profileForm');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const msgEl = document.getElementById('profileInfoMsg');
                    if (msgEl) msgEl.style.display = 'none';
                    const newName = nameInput.value.trim();
                    const newEmail = emailInput ? emailInput.value.trim().toLowerCase() : session.email;
                    const newPhone = phoneInput ? phoneInput.value.trim() : (user ? user.phone : '');

                    if (!newName) return;
                    if (phoneInput) {
                        const digitsOnly = newPhone.replace('+994', '').replace(/\D/g, '');
                        if (!newPhone.startsWith('+994') || digitsOnly.length !== 9) {
                            if (msgEl) { msgEl.textContent = 'Telefon nömrəsini düzgün formatda daxil edin.'; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                            return;
                        }
                    }
                    const allUsers = getUsers();
                    const i = allUsers.findIndex(u => u.email === session.email);
                    if (i === -1) return;

                    if (newEmail && newEmail !== session.email) {
                        if (newEmail === ADMIN_EMAIL || allUsers.some(u => u.email === newEmail)) {
                            if (msgEl) { msgEl.textContent = 'Bu email artıq istifadə olunur.'; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                            return;
                        }
                        allUsers[i].email = newEmail;
                        setSession({ name: newName, email: newEmail, isAdmin: false });
                    }
                    allUsers[i].name = newName;
                    allUsers[i].phone = newPhone;
                    const genderInput = document.getElementById('profileGenderInput');
                    if (genderInput) allUsers[i].gender = genderInput.value;
                    saveUsers(allUsers);
                    setSession({ name: newName, email: allUsers[i].email, isAdmin: false });
                    updateAuthUI();
                    nameHeading.textContent = newName;
                    emailDisplay.textContent = allUsers[i].email;
                    if (msgEl) { msgEl.textContent = '✅ Məlumatlarınız yadda saxlanıldı.'; msgEl.className = 'cart-message success'; msgEl.style.display = 'block'; }
                });
            }

            const profilePasswordForm = document.getElementById('profilePasswordForm');
            if (profilePasswordForm) {
                profilePasswordForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const msgEl = document.getElementById('profilePasswordMsg');
                    if (msgEl) msgEl.style.display = 'none';
                    const current = document.getElementById('currentPasswordInput').value;
                    const next = document.getElementById('newPasswordInput').value;
                    const confirmEl = document.getElementById('newPasswordConfirmInput');
                    const nextConfirm = confirmEl ? confirmEl.value : next;
                    const allUsers = getUsers();
                    const i = allUsers.findIndex(u => u.email === session.email);
                    if (i === -1) return;
                    if (allUsers[i].password !== current) {
                        if (msgEl) { msgEl.textContent = 'Hazırkı şifrə yanlışdır.'; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                        return;
                    }
                    if (!next || next.length < 4) {
                        if (msgEl) { msgEl.textContent = 'Yeni şifrə ən azı 4 simvol olmalıdır.'; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                        return;
                    }
                    if (confirmEl && next !== nextConfirm) {
                        if (msgEl) { msgEl.textContent = 'Yeni şifrələr uyğun gəlmir.'; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                        return;
                    }
                    allUsers[i].password = next;
                    saveUsers(allUsers);
                    logSecurity(session.email, 'Şifrə profil bölməsindən dəyişdirildi');
                    if (msgEl) { msgEl.textContent = '✅ Şifrəniz yeniləndi.'; msgEl.className = 'cart-message success'; msgEl.style.display = 'block'; }
                    profilePasswordForm.reset();
                });
            }
        }
    }

    // ==========================================
    // 8b. BONUSLARIM SƏHİFƏSİ
    // ==========================================
    if (document.body.getAttribute('data-page') === 'bonus') {
        const session = getSession();
        if (!session || session.isAdmin) {
            window.location.href = 'index.html';
        } else {
            const user = getCurrentUserRecord();
            const bonusAmountDisplay = document.getElementById('bonusAmountDisplay');
            if (bonusAmountDisplay && user) bonusAmountDisplay.textContent = `${(user.sdrBonus || 0).toFixed(2)} SDR`;

            const redeemForm = document.getElementById('bonusRedeemForm');
            if (redeemForm) {
                redeemForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const msgEl = document.getElementById('bonusRedeemMsg');
                    if (msgEl) msgEl.style.display = 'none';
                    const amount = parseFloat(document.getElementById('bonusRedeemAmount').value);
                    const allUsers = getUsers();
                    const idx = allUsers.findIndex(u => u.email === session.email);
                    if (idx === -1) return;
                    const available = allUsers[idx].sdrBonus || 0;
                    if (isNaN(amount) || amount <= 0 || amount > available) {
                        if (msgEl) { msgEl.textContent = `Zəhmət olmasa 0 - ${available.toFixed(2)} SDR aralığında məbləğ daxil edin.`; msgEl.className = 'cart-message error'; msgEl.style.display = 'block'; }
                        return;
                    }
                    allUsers[idx].sdrBonus = available - amount;
                    allUsers[idx].balance = (allUsers[idx].balance || 0) + amount;
                    saveUsers(allUsers);
                    if (bonusAmountDisplay) bonusAmountDisplay.textContent = `${allUsers[idx].sdrBonus.toFixed(2)} SDR`;
                    if (msgEl) { msgEl.textContent = `✅ ${amount.toFixed(2)} SDR Bonus balansınıza (₼${amount.toFixed(2)}) çevrildi.`; msgEl.className = 'cart-message success'; msgEl.style.display = 'block'; }
                    redeemForm.reset();
                });
            }
        }
    }

    // ==========================================
    // 9. HESABIM SƏHİFƏLƏRİ (Balans / Sifarişlər)
    // ==========================================
    if (document.body.getAttribute('data-page') === 'account') {
        const user = getCurrentUserRecord();

        const balanceAmountDisplay = document.getElementById('balanceAmountDisplay');
        if (balanceAmountDisplay && user) {
            balanceAmountDisplay.textContent = `₼${(user.balance || 0).toFixed(2)}`;
        }

        const M10_NUMBER = '+994503010794';
        const topupForm = document.getElementById('topupForm');
        const receiptUploadBox = document.getElementById('receiptUploadBox');
        const receiptFileInput = document.getElementById('receiptFileInput');
        const receiptPreview = document.getElementById('receiptPreview');
        let receiptDataUrl = null;

        const m10NumberDisplay = document.getElementById('m10NumberDisplay');
        if (m10NumberDisplay) m10NumberDisplay.textContent = M10_NUMBER;
        const m10CopyBtn = document.getElementById('m10CopyBtn');
        if (m10CopyBtn) {
            m10CopyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(M10_NUMBER).then(() => {
                    m10CopyBtn.textContent = 'Kopyalandı ✓';
                    setTimeout(() => { m10CopyBtn.textContent = 'Kopyala'; }, 1500);
                }).catch(() => {});
            });
        }

        if (receiptUploadBox && receiptFileInput) {
            receiptUploadBox.addEventListener('click', () => receiptFileInput.click());
            receiptFileInput.addEventListener('change', () => {
                const file = receiptFileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    receiptDataUrl = reader.result;
                    receiptUploadBox.classList.add('has-file');
                    if (receiptPreview) {
                        if (file.type.startsWith('image/')) {
                            receiptPreview.src = receiptDataUrl;
                            receiptPreview.style.display = 'block';
                        } else {
                            receiptPreview.style.display = 'none';
                        }
                    }
                    const uploadLabel = document.getElementById('receiptUploadLabel');
                    if (uploadLabel) uploadLabel.textContent = `✅ Seçildi: ${file.name}`;
                };
                reader.readAsDataURL(file);
            });
        }

        function renderTopupHistory() {
            const listEl = document.getElementById('topupHistoryList');
            if (!listEl) return;
            const session = getSession();
            const mine = getTopups().filter(t => t.userEmail === session.email).sort((a, b) => b.timestamp - a.timestamp);
            if (mine.length === 0) {
                listEl.innerHTML = `<p style="color:var(--text-muted);">Hələ balans artırma sorğunuz yoxdur.</p>`;
                return;
            }
            const badgeClass = { 'Gözləmədə': 'badge-pending', 'Təsdiqləndi': 'badge-approved', 'Ləğv edildi': 'badge-rejected' };
            listEl.innerHTML = mine.map(t => `
                <div class="topup-history-item">
                    <div>
                        <strong>₼${t.amount.toFixed(2)}</strong>
                        <div style="color:var(--text-muted); font-size:0.8rem;">${t.date}</div>
                        ${t.status === 'Ləğv edildi' && t.reason ? `<div style="color:#ef4444; font-size:0.8rem; margin-top:4px;">Səbəb: ${t.reason}</div>` : ''}
                    </div>
                    <span class="${badgeClass[t.status] || 'badge-pending'}">${t.status}</span>
                </div>
            `).join('');
        }
        renderTopupHistory();

        if (topupForm) {
            topupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const amount = parseFloat(document.getElementById('topupAmount').value);
                const topupMsg = document.getElementById('topupMessage');
                if (topupMsg) topupMsg.style.display = 'none';

                if (isNaN(amount) || amount <= 0) {
                    if (topupMsg) { topupMsg.textContent = 'Zəhmət olmasa düzgün məbləğ daxil edin.'; topupMsg.className = 'cart-message error'; topupMsg.style.display = 'block'; }
                    return;
                }
                if (!receiptDataUrl) {
                    if (topupMsg) { topupMsg.textContent = 'Zəhmət olmasa ödəniş qəbzinin şəklini/faylını yükləyin.'; topupMsg.className = 'cart-message error'; topupMsg.style.display = 'block'; }
                    return;
                }

                const session = getSession();
                const topups = getTopups();
                topups.push({
                    id: 'TOP' + Date.now(),
                    userEmail: session.email,
                    userName: session.name,
                    amount,
                    receipt: receiptDataUrl,
                    status: 'Gözləmədə',
                    reason: '',
                    timestamp: Date.now(),
                    date: new Date().toLocaleString('az-AZ')
                });
                saveTopups(topups);

                if (topupMsg) { topupMsg.textContent = '✅ Sorğunuz göndərildi! Admin qəbzi yoxladıqdan sonra balansınız artırılacaq.'; topupMsg.className = 'cart-message success'; topupMsg.style.display = 'block'; }
                topupForm.reset();
                receiptDataUrl = null;
                if (receiptUploadBox) receiptUploadBox.classList.remove('has-file');
                if (receiptPreview) receiptPreview.style.display = 'none';
                const uploadLabel = document.getElementById('receiptUploadLabel');
                if (uploadLabel) uploadLabel.textContent = '📎 Qəbz şəklini/PDF-ni yükləmək üçün klikləyin';
                renderTopupHistory();
            });
        }

        const ordersHistoryList = document.getElementById('ordersHistoryList');
        if (ordersHistoryList) {
            const orders = (user && user.orders) || [];
            if (orders.length === 0) {
                ordersHistoryList.innerHTML = `<p style="color:var(--text-muted);">Hələ heç bir sifarişiniz yoxdur.</p>`;
            } else {
                ordersHistoryList.innerHTML = orders.slice().reverse().map(o => `
                    <div class="order-card">
                        <div class="order-card-header">
                            <strong>${o.id}</strong>
                            <span style="color:var(--text-muted); font-size:0.85rem;">${o.date}</span>
                        </div>
                        <span class="badge badge-role" style="margin:6px 0; display:inline-block;">${o.status || 'Gözləmədə'}</span>
                        <ul style="padding-left:18px; line-height:1.8; margin:8px 0;">
                            ${o.items.map(i => `<li>${i.name} — ${i.qty} ədəd — ₼${(i.price * i.qty).toFixed(2)}</li>`).join('')}
                        </ul>
                        ${o.couponCode ? `<div style="color:#22c55e; font-size:0.85rem;">Promokod: ${o.couponCode} (-₼${(o.discount || 0).toFixed(2)})</div>` : ''}
                        ${o.bonusEarned ? `<div style="color:#f59e0b; font-size:0.85rem;">🎁 Qazanılan SDR Bonus: +${o.bonusEarned}</div>` : ''}
                        <div style="text-align:right; font-weight:700; color:var(--primary);">Cəmi: ₼${o.total.toFixed(2)}</div>
                    </div>
                `).join('');
            }
        }
    }

});