// ========================================
// BRAHMINS PICKLES & POWDERS - LIQUID GLASS JS
// ========================================

class LiquidGlassWebsite {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('brahmin_cart')) || [];
        this.init();
    }

    init() {
        this.setupLoadingScreen();
        this.setupThemeToggle();
        this.setupScrollReveal();
        this.setupSmoothScrolling();
        this.setupLiquidEffects();
        this.setupNavigation();
        this.initializeAnimations();
        this.setupProductPopup();
        this.setupCartFunctionality();
        this.setupAdvancedCart();
        this.updateCartDisplay();
        this.setupSettingsMenu();
    }

    // Loading Screen Functionality
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        // Add click handlers to all navigation links
        const navLinks = document.querySelectorAll('.nav-links a, .logo-container');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only show loading for links that navigate to other pages
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    this.showLoadingScreen();
                    // Allow normal navigation to proceed
                    setTimeout(() => {
                        this.hideLoadingScreen();
                    }, 2000); // Hide after 2 seconds
                }
            });
        });
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }

    // Product Popup Functionality
    setupProductPopup() {
        const popup = document.getElementById('productPopup');
        const closeBtn = document.getElementById('closePopup');
        const productCards = document.querySelectorAll('.clickable-product');
        
        if (!popup) return;

        // Open popup when clicking on product cards
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productName = card.getAttribute('data-product-name');
                const productType = card.getAttribute('data-product-type');
                
                this.openProductPopup(productName, productType);
            });
        });

        // Close popup
        closeBtn?.addEventListener('click', () => this.closeProductPopup());
        popup.addEventListener('click', (e) => {
            if (e.target === popup) this.closeProductPopup();
        });

        // Setup quantity controls in popup
        this.setupPopupQuantityControls();
    }

    openProductPopup(productName, productType) {
        const popup = document.getElementById('productPopup');
        const productNameEl = document.getElementById('popupProductName');
        
        if (productNameEl) productNameEl.textContent = productName;
        popup.classList.add('active');
        
        // Reset quantities
        const quantityElements = popup.querySelectorAll('.quantity');
        quantityElements.forEach(el => el.textContent = '0');
        
        // Store current product info
        popup.setAttribute('data-current-product', productName);
        popup.setAttribute('data-current-type', productType);
        
        this.updateAddToCartButton();
    }

    closeProductPopup() {
        const popup = document.getElementById('productPopup');
        popup.classList.remove('active');
    }

    setupPopupQuantityControls() {
        const popup = document.getElementById('productPopup');
        if (!popup) return;

        const variantOptions = popup.querySelectorAll('.variant-option');
        
        variantOptions.forEach(option => {
            const minusBtn = option.querySelector('.minus');
            const plusBtn = option.querySelector('.plus');
            const quantityEl = option.querySelector('.quantity');
            
            minusBtn?.addEventListener('click', () => {
                let quantity = parseInt(quantityEl.textContent);
                if (quantity > 0) {
                    quantity--;
                    quantityEl.textContent = quantity;
                    this.updateAddToCartButton();
                }
            });
            
            plusBtn?.addEventListener('click', () => {
                let quantity = parseInt(quantityEl.textContent);
                quantity++;
                quantityEl.textContent = quantity;
                this.updateAddToCartButton();
            });
        });

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn?.addEventListener('click', () => this.addToCartFromPopup());
    }

    updateAddToCartButton() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const popup = document.getElementById('productPopup');
        
        if (!addToCartBtn || !popup) return;
        
        const quantities = popup.querySelectorAll('.quantity');
        let hasItems = false;
        
        quantities.forEach(el => {
            if (parseInt(el.textContent) > 0) hasItems = true;
        });
        
        addToCartBtn.disabled = !hasItems;
        addToCartBtn.textContent = hasItems ? 'Add to Cart' : 'Select Quantity';
    }

    addToCartFromPopup() {
        const popup = document.getElementById('productPopup');
        const productName = popup.getAttribute('data-current-product');
        const productType = popup.getAttribute('data-current-type');
        
        const variantOptions = popup.querySelectorAll('.variant-option');
        
        variantOptions.forEach(option => {
            const quantity = parseInt(option.querySelector('.quantity').textContent);
            if (quantity > 0) {
                const weight = option.getAttribute('data-weight');
                const price = parseInt(option.getAttribute('data-price'));
                
                this.addToCart({
                    name: productName,
                    type: productType,
                    weight: weight + 'gm',
                    price: price,
                    quantity: quantity,
                    id: `${productName}_${weight}gm`
                });
            }
        });
        
        this.closeProductPopup();
        this.showAddToCartNotification();
    }

    // Cart Functionality
    setupCartFunctionality() {
        // Setup cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
            this.setupCartPageControls();
        }
    }

    addToCart(item) {
        const existingIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingIndex >= 0) {
            this.cart[existingIndex].quantity += item.quantity;
        } else {
            this.cart.push(item);
        }
        
        this.saveCart();
        this.updateCartDisplay();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
        }
    }

    updateCartItemQuantity(itemId, newQuantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                if (window.location.pathname.includes('cart.html')) {
                    this.renderCartPage();
                }
            }
        }
    }

    saveCart() {
        localStorage.setItem('brahmin_cart', JSON.stringify(this.cart));
    }

    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            if (el) el.textContent = totalItems;
        });
    }

    renderCartPage() {
        const cartContainer = document.getElementById('cartContainer');
        const emptyMessage = document.getElementById('emptyCartMessage');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartContainer) return;
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = '';
            emptyMessage?.style.setProperty('display', 'block');
            cartSummary?.style.setProperty('display', 'none');
            return;
        }
        
        emptyMessage?.style.setProperty('display', 'none');
        cartSummary?.style.setProperty('display', 'block');
        
        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.weight}</p>
                    <div class="cart-item-price">₹${item.price} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" onclick="website.updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="website.updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="cart-item-total">₹${item.price * item.quantity}</div>
                    <button class="qty-btn" style="background: #dc3545;" onclick="website.removeFromCart('${item.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
        
        this.updateCartSummary();
    }

    updateCartSummary() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const totalItemsEl = document.getElementById('totalItems');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        
        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
        if (totalEl) totalEl.textContent = `₹${subtotal}`;
    }

    setupCartPageControls() {
        const clearCartBtn = document.getElementById('clearCartBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        clearCartBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.renderCartPage();
            }
        });
        
        checkoutBtn?.addEventListener('click', () => this.showOrderModal());
    }

    showOrderModal() {
        const orderModal = document.getElementById('orderModal');
        const closeBtn = document.getElementById('closeOrderModal');
        
        if (orderModal) {
            orderModal.classList.add('active');
            
            closeBtn?.addEventListener('click', () => {
                orderModal.classList.remove('active');
                // Clear cart after order
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.renderCartPage();
            });
        }
    }

    showAddToCartNotification() {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--accent-color);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 99999;
            box-shadow: var(--glass-shadow);
            backdrop-filter: var(--backdrop-blur);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = '✅ Added to cart!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Advanced Cart System
    setupAdvancedCart() {
        // Setup quick add buttons for chapathis and powders
        const quickAddButtons = document.querySelectorAll('.add-to-cart-quick:not(.pickle-variant)');
        quickAddButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCard = btn.closest('.product-card');
                const productName = productCard.getAttribute('data-product-name');
                const productType = productCard.getAttribute('data-product-type');
                const productPrice = parseInt(productCard.getAttribute('data-product-price'));
                
                this.quickAddToCart({
                    name: productName,
                    type: productType,
                    price: productPrice,
                    quantity: 1,
                    id: `${productName}_single`,
                    weight: productType === 'powder' ? '1kg' : '1pc'
                });
                
                this.showQuickAddAnimation(btn);
            });
        });

        // Setup pickle variant buttons
        const pickleButtons = document.querySelectorAll('.pickle-variant');
        pickleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCard = btn.closest('.product-card');
                const productName = productCard.getAttribute('data-product-name');
                const productType = productCard.getAttribute('data-product-type');
                
                this.openProductPopup(productName, productType);
            });
        });

        // Setup cart sidebar
        this.setupCartSidebar();
        
        // Setup cart icon click to open sidebar
        const cartLinks = document.querySelectorAll('.cart-link');
        cartLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!window.location.pathname.includes('cart.html')) {
                    this.openCartSidebar();
                } else {
                    window.location.href = 'cart.html';
                }
            });
        });
    }

    quickAddToCart(item) {
        const existingIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingIndex >= 0) {
            this.cart[existingIndex].quantity += item.quantity;
        } else {
            this.cart.push(item);
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartSidebar();
        this.showQuickAddNotification(item.name);
    }

    showQuickAddAnimation(button) {
        button.classList.add('added');
        const originalIcon = button.querySelector('.plus-icon');
        originalIcon.textContent = '✓';
        
        setTimeout(() => {
            button.classList.remove('added');
            originalIcon.textContent = '+';
        }, 1000);
    }

    showQuickAddNotification(itemName) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.quick-add-notification');
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement('div');
        notification.className = 'quick-add-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✅</span>
                <span>Added "${itemName}" to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartCloseBtn = document.getElementById('cartCloseBtn');
        const sidebarCheckoutBtn = document.getElementById('sidebarCheckoutBtn');
        
        if (!cartSidebar) return;

        // Close sidebar events
        cartCloseBtn?.addEventListener('click', () => this.closeCartSidebar());
        cartOverlay?.addEventListener('click', () => this.closeCartSidebar());
        
        // Quick checkout from sidebar
        sidebarCheckoutBtn?.addEventListener('click', () => {
            this.closeCartSidebar();
            this.showOrderModal();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
                this.closeCartSidebar();
            }
        });
    }

    openCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            this.updateCartSidebar();
            document.body.style.overflow = 'hidden';
        }
    }

    closeCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateCartSidebar() {
        const cartSidebarBody = document.getElementById('cartSidebarBody');
        const sidebarTotalItems = document.getElementById('sidebarTotalItems');
        const sidebarTotal = document.getElementById('sidebarTotal');
        
        if (!cartSidebarBody) return;
        
        if (this.cart.length === 0) {
            cartSidebarBody.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <p>Your cart is empty</p>
                    <button class="liquid-button" onclick="website.closeCartSidebar()" style="margin-top: 1rem;">Continue Shopping</button>
                </div>
            `;
            if (sidebarTotalItems) sidebarTotalItems.textContent = '0';
            if (sidebarTotal) sidebarTotal.textContent = '₹0';
            return;
        }
        
        cartSidebarBody.innerHTML = this.cart.map(item => `
            <div class="cart-item-mini">
                <div class="cart-item-mini-info">
                    <h4>${item.name}</h4>
                    <p>${item.weight} • ₹${item.price} each</p>
                </div>
                <div class="cart-item-mini-controls">
                    <button class="mini-qty-btn" onclick="website.updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="mini-quantity">${item.quantity}</span>
                    <button class="mini-qty-btn" onclick="website.updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
        `).join('');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (sidebarTotalItems) sidebarTotalItems.textContent = totalItems;
        if (sidebarTotal) sidebarTotal.textContent = `₹${subtotal}`;
    }

    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            if (el) {
                el.textContent = totalItems;
                el.classList.add('updated');
                setTimeout(() => el.classList.remove('updated'), 300);
            }
        });
        
        // Update sidebar if it's open
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            this.updateCartSidebar();
        }
    }

    // Theme Toggle Functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // Get saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(newTheme);
                
                // Liquid glass animation feedback
                themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
                setTimeout(() => {
                    themeToggle.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            });
        }
    }

    updateThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update settings dropdown theme icon and text
        const themeIconSetting = document.getElementById('themeIconSetting');
        const themeTextSetting = document.getElementById('themeTextSetting');
        if (themeIconSetting) {
            themeIconSetting.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (themeTextSetting) {
            themeTextSetting.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Settings Menu Functionality
    setupSettingsMenu() {
        const settingsButton = document.getElementById('settingsButton');
        const settingsDropdown = document.getElementById('settingsDropdown');
        const themeToggleSetting = document.getElementById('themeToggleSetting');
        
        if (!settingsButton || !settingsDropdown) return;

        // Toggle settings dropdown
        settingsButton.addEventListener('click', () => {
            settingsDropdown.classList.toggle('show');
            
            // Add animation
            settingsButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                settingsButton.style.transform = 'scale(1)';
            }, 150);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsButton.contains(e.target) && !settingsDropdown.contains(e.target)) {
                settingsDropdown.classList.remove('show');
            }
        });

        // Theme toggle in settings
        if (themeToggleSetting) {
            themeToggleSetting.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(newTheme);
                
                // Add animation
                themeToggleSetting.style.transform = 'scale(0.95) rotate(180deg)';
                setTimeout(() => {
                    themeToggleSetting.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            });
        }

        // Initialize theme display
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.updateThemeIcon(savedTheme);

        // ESC key to close settings
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsDropdown.classList.contains('show')) {
                settingsDropdown.classList.remove('show');
            }
        });
    }

    // Scroll Reveal Animation
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add staggered animation for grid items
                    if (entry.target.parentElement?.classList.contains('products-grid') ||
                        entry.target.parentElement?.classList.contains('features-grid')) {
                        const siblings = Array.from(entry.target.parentElement.children);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                }
            });
        }, observerOptions);

        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // Smooth Scrolling for Anchor Links
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // Liquid Glass Effects
    setupLiquidEffects() {
        // Parallax effect for background elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Update CSS custom property for scroll-based animations
            document.documentElement.style.setProperty('--scroll-y', `${scrolled}px`);
            
            // Liquid background movement
            const liquidElements = document.querySelectorAll('body::before, body::after');
            liquidElements.forEach(el => {
                if (el) {
                    el.style.transform = `translateY(${rate}px)`;
                }
            });
        });

        // Hover effects for cards
        document.querySelectorAll('.glass-card, .product-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e, card);
            });
        });

        // Floating animation for logo
        const logo = document.querySelector('.logo');
        if (logo) {
            setInterval(() => {
                logo.style.transform += ' translateY(-2px)';
                setTimeout(() => {
                    logo.style.transform = logo.style.transform.replace(' translateY(-2px)', '');
                }, 1000);
            }, 3000);
        }
    }

    // Create ripple effect on hover
    createRippleEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Navigation Effects
    setupNavigation() {
        const nav = document.querySelector('nav');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class for navigation styling
            if (currentScrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            // Hide/show navigation on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });

        // Active navigation link highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Initialize Loading Animations
    initializeAnimations() {
        // Add loading animation to elements
        document.querySelectorAll('.liquid-loading').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
            el.classList.add('animate');
        });

        // Staggered animation for grid items
        document.querySelectorAll('.products-grid .product-card, .features-grid .feature').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('liquid-loading');
        });

        // Brand name special animation
        const brandName = document.querySelector('.brand-name');
        if (brandName) {
            brandName.addEventListener('mouseenter', () => {
                brandName.style.animation = 'none';
                brandName.offsetHeight; // Trigger reflow
                brandName.style.animation = 'brandShimmer 1s ease-in-out';
            });
        }
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Performance optimization for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Enhanced Scroll Reveal Animation with Liquid Effects
class LiquidScrollReveal {
    constructor() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });
        
        this.init();
    }

    init() {
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('revealed');
                
                // Add liquid glass animation classes
                if (element.classList.contains('glass-card')) {
                    element.style.animation = 'liquidGlassReveal 0.8s ease-out forwards';
                } else if (element.classList.contains('product-card')) {
                    element.style.animation = 'liquidCardReveal 0.6s ease-out forwards';
                }
                
                // Unobserve after animation
                this.observer.unobserve(element);
            }
        });
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }

    @keyframes liquidGlassReveal {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
            filter: blur(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    @keyframes liquidCardReveal {
        from {
            opacity: 0;
            transform: translateY(30px) rotateX(20deg);
            filter: blur(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
            filter: blur(0);
        }
    }

    .nav-links a.active {
        background: var(--glass-hover);
        transform: translateY(-2px);
        box-shadow: var(--glass-shadow);
    }

    nav.scrolled {
        backdrop-filter: var(--backdrop-blur-strong);
        box-shadow: var(--glass-shadow-strong);
    }

    .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .scroll-reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }

    .liquid-loading {
        animation: liquidFadeIn 1s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.website = new LiquidGlassWebsite();
    new LiquidScrollReveal();
    
    // Add loading completed class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1000);
});

// Performance monitoring
window.addEventListener('load', () => {
    // Log performance metrics
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`🚀 Liquid Glass Website loaded in ${pageLoadTime}ms`);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiquidGlassWebsite, LiquidScrollReveal };
}