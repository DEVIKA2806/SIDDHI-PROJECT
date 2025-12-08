// Frontend/script.js (COMPLETE FIXED VERSION)

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and Constants ---
    const API_BASE = '/api';
    const loginPanel = document.getElementById('login-panel');
    const contactPanel = document.getElementById('contact-panel');
    const cartPanel = document.getElementById('cart-panel');

    // UI Elements
    // FIX: Targeting the cart container (.cart) and login icon (i)
    const loginIcon = document.getElementById('login-icon'); 
    const logoutBtn = document.getElementById('logout-btn'); 
    const userNameDisplay = document.getElementById('user-name-display'); 
    const authPanelTitle = document.getElementById('auth-panel-title');

    // Cart elements
    const cartIcon = document.querySelector('.nav-right .cart');
    const cartCountElement = document.createElement('span'); 
    cartCountElement.classList.add('cart-count');
    cartCountElement.textContent = '0';
    if (cartIcon) {
        cartIcon.appendChild(cartCountElement);
    }
    
    // Forms
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const contactForm = document.querySelector('.contact-form');
    const newsletterForm = document.querySelector('.footer-newsletter form');

    // Cart/Checkout Elements
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartMessageArea = document.getElementById('cart-message-area');

    const navContactLinks = document.querySelectorAll('.nav-items a[href="#"], .footer-links a[href=""]'); // Fix for footer links
    const closeButtons = document.querySelectorAll('.auth-panel .close-btn');

    // --- Helper Functions ---

    function togglePanel(panel, show) {
        if (panel) {
            panel.style.display = show ? 'flex' : 'none';
            if (show && panel === cartPanel && cartItemsContainer) {
                fetchCart();
            }
            if (!show) {
                document.querySelectorAll('.form-message').forEach(el => el.textContent = '');
                if (cartMessageArea) {
                    cartMessageArea.textContent = '';
                    cartMessageArea.classList.remove('success-message', 'error-message');
                }
            }
        }
    }

    async function postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
    
    async function fetchData(url) {
        const response = await fetch(url);
        return response.json();
    }

    function updateCartDisplay(cart) {
        if (!cartItemsContainer) return;

        let total = 0;
        let count = 0;
        cartItemsContainer.innerHTML = '';
        
        if (cart && cart.items && cart.items.length > 0) {
            emptyCartMessage.style.display = 'none';
            
            cart.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                count += item.quantity;
                
                const itemImageSrc = item.image.startsWith('Assets/') ? `../${item.image}` : `../Assets/${item.image}`;
                
                const itemHTML = `
                    <div class="cart-item">
                        <img src="${itemImageSrc}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price-qty">₹${item.price.toFixed(2)} x ${item.quantity} = ₹${itemTotal.toFixed(2)}</p>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            });
            
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.style.display = 'block';
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.style.display = 'none';
        }
        
        if (document.getElementById('cart-panel-title')) document.getElementById('cart-panel-title').textContent = `Your Shopping Cart (${count} Items)`;
        if (cartSubtotal) cartSubtotal.textContent = `₹${total.toFixed(2)}`;
        if (cartCountElement) cartCountElement.textContent = count;
    }
    
    async function fetchCart() {
        try {
            const result = await fetchData(`${API_BASE}/cart`);
            if (result.success) {
                updateCartDisplay(result.cart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }
    
    // --- Authentication State Management ---

    function checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const isLoggedIn = !!user;

        if (loginIcon) loginIcon.classList.toggle('hidden', isLoggedIn);
        if (userNameDisplay) userNameDisplay.classList.toggle('hidden', !isLoggedIn);
        if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);

        if (isLoggedIn && userNameDisplay) {
            userNameDisplay.textContent = `Hi, ${user.name.split(' ')[0]}!`;
        }
    }

    function loginUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkAuthStatus();
    }

    function logoutUser() {
        localStorage.removeItem('currentUser');
        checkAuthStatus();
        alert('You have been logged out.');
        fetchCart(); 
    }

    // --- Cart/Checkout View Toggling ---
    function showCheckoutView() {
        if (!cartItemsContainer || !cartSubtotal || !proceedToCheckoutBtn || !emptyCartMessage || !backToCartBtn || !checkoutForm) return;

        document.getElementById('cart-panel-title').textContent = 'Confirm Order & Shipping';
        cartItemsContainer.classList.add('hidden');
        cartSubtotal.closest('.cart-summary').classList.add('hidden');
        proceedToCheckoutBtn.classList.add('hidden');
        emptyCartMessage.classList.add('hidden');
        
        backToCartBtn.classList.remove('hidden');
        checkoutForm.classList.remove('hidden');
    }

    function showCartView() {
        if (!cartItemsContainer || !cartSubtotal || !emptyCartMessage || !backToCartBtn || !checkoutForm) return;
        
        if (cartMessageArea) {
             cartMessageArea.textContent = '';
             cartMessageArea.classList.remove('success-message', 'error-message');
        }
        
        document.getElementById('cart-panel-title').textContent = 'Your Shopping Cart';
        cartItemsContainer.classList.remove('hidden');
        cartSubtotal.closest('.cart-summary').classList.remove('hidden');
        emptyCartMessage.classList.remove('hidden');
        
        backToCartBtn.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        
        fetchCart(); 
    }
    
    // --- 1. Panel/Modal Listeners ---

    // FIX: Listener added directly to the icon
    if (loginIcon) {
        loginIcon.addEventListener('click', () => {
             // Set login panel title on opening
            if (authPanelTitle) authPanelTitle.textContent = 'Welcome Back!';
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
            togglePanel(loginPanel, true);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // FIX: Listener added directly to the cart container (.cart)
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            togglePanel(cartPanel, true);
        });
    }

    navContactLinks.forEach(link => {
        // Find links containing 'Contact Us' or just 'Contact'
        if (link.textContent.includes('Contact')) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                togglePanel(contactPanel, true);
            });
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.closest('.auth-panel');
            togglePanel(panel, false);
            if (panel === cartPanel) {
                showCartView();
            }
        });
    });

    // Close panel when clicking outside
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                togglePanel(panel, false);
                if (panel === cartPanel) {
                    showCartView();
                }
            }
        });
    });

    // --- 2. Auth Panel Form Switching Logic (Fixed redundant h3) ---

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
            if (authPanelTitle) authPanelTitle.textContent = 'Create Account';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
            if (authPanelTitle) authPanelTitle.textContent = 'Welcome Back!';
        });
    }

    // --- 3. Form Submission Handling (Auth, Contact, Newsletter) ---

    function displayFormMessage(form, message, isSuccess) {
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.classList.add('form-message');
            form.appendChild(messageElement);
        }
        messageElement.classList.remove('success-message', 'error-message');
        messageElement.classList.add(isSuccess ? 'success-message' : 'error-message');
        messageElement.textContent = message;
        
        setTimeout(() => messageElement.textContent = '', 3000); 
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.elements[0].value;
            const password = loginForm.elements[1].value;
            const result = await postData(`${API_BASE}/login`, { email, password });
            displayFormMessage(loginForm, result.message, result.success);
            if (result.success) {
                loginUser(result.user);
                setTimeout(() => togglePanel(loginPanel, false), 1000);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = registerForm.elements[0].value;
            const email = registerForm.elements[1].value;
            const password = registerForm.elements[2].value;
            const confirmPassword = registerForm.elements[3].value;

            if (password !== confirmPassword) {
                return displayFormMessage(registerForm, 'Passwords do not match.', false);
            }

            const result = await postData(`${API_BASE}/register`, { fullName, email, password });
            displayFormMessage(registerForm, result.message, result.success);
            if (result.success) {
                registerForm.reset();
                setTimeout(() => {
                    if (showLoginLink) showLoginLink.click();
                }, 1500);
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = contactForm.elements[0].value;
            const email = contactForm.elements[1].value;
            const message = contactForm.elements[2].value;

            const result = await postData(`${API_BASE}/contact`, { name, email, message });
            displayFormMessage(contactForm, result.message, result.success);
            contactForm.reset();
            if (result.success) {
                 setTimeout(() => togglePanel(contactPanel, false), 1500);
            }
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            const result = await postData(`${API_BASE}/subscribe`, { email });
            displayFormMessage(newsletterForm, result.message, result.success);
            newsletterForm.reset();
        });
    }


    // --- 4. Cart Logic (Add to Cart Fix) ---

    document.body.addEventListener('click', async (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small')) {
            e.preventDefault();
            
            const targetElement = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small');
            const card = targetElement.closest('.product-card') || targetElement.closest('.product-card-small');
            if (!card) return;

            const isBulk = targetElement.classList.contains('add-to-cart-btn-gold');
            
            if (isBulk) {
                togglePanel(contactPanel, true);
                return;
            }

            const isSmall = card.classList.contains('product-card-small');
            const infoContainer = card.querySelector(isSmall ? '.card-info-small' : '.card-info');
            
            const nameElement = infoContainer.querySelector(isSmall ? '.product-name-small' : '.product-name');
            const priceElement = infoContainer.querySelector(isSmall ? '.product-price-small' : '.product-price');
            const imageElement = card.querySelector('img');

            if (!nameElement || !priceElement || !imageElement) {
                console.error("Missing product data elements.");
                return;
            }

            const name = nameElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            const imagePath = imageElement.getAttribute('src');
            
            // FIX: Robustly parse the price (removes currency symbols, commas)
            const rawPrice = priceText.replace(/[^0-9.]/g, '').replace(/,/g, '');
            
            // FIX: Create a stable unique ID: Page_ProductShortName
            const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'index';
            const uniqueProductId = `${currentPage.toUpperCase()}_${name.split(' ').slice(0, 2).join('_').toUpperCase()}`; 
            
            const cleanImagePath = imagePath.replace('../', ''); 
            
            const productData = {
                product_id: uniqueProductId,
                name: name,
                price: rawPrice,
                image: cleanImagePath,
                quantity: 1 
            };

            try {
                const result = await postData(`${API_BASE}/cart/add`, productData);
                if (result.success) {
                    updateCartDisplay(result.cart);
                    if(cartCountElement) cartCountElement.textContent = result.cartCount;
                    if(cartIcon) {
                        cartIcon.style.transform = 'scale(1.2)';
                        setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
                    }
                } else {
                    console.error('Cart API Error:', result.message);
                }
            } catch (error) {
                console.error('Add to Cart Fetch Error:', error);
            }
        }
    });

    // --- 5. Checkout Logic (Kept for completeness) ---

    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', showCheckoutView);
    }
    
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', showCartView);
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(checkoutForm);
            const data = Object.fromEntries(formData.entries());
            
            if (!/^[0-9]{6}$/.test(data.pincode)) {
                if (cartMessageArea) {
                    cartMessageArea.textContent = 'Error: Pincode must be 6 digits.';
                    cartMessageArea.classList.add('error-message');
                }
                return;
            }
            if (!/^[0-9]{10}$/.test(data.mobile)) {
                if (cartMessageArea) {
                    cartMessageArea.textContent = 'Error: Mobile number must be 10 digits.';
                    cartMessageArea.classList.add('error-message');
                }
                return;
            }

            if (cartMessageArea) {
                cartMessageArea.textContent = 'Processing order...';
                cartMessageArea.classList.remove('success-message', 'error-message');
            }

            const result = await postData(`${API_BASE}/checkout`, data);

            if (cartMessageArea) {
                 cartMessageArea.textContent = result.message;
                 cartMessageArea.classList.add(result.success ? 'success-message' : 'error-message');
            }

            if (result.success) {
                if (cartCountElement) cartCountElement.textContent = '0';
                checkoutForm.reset();
                
                setTimeout(() => {
                    showCartView(); 
                    togglePanel(cartPanel, false);
                }, 4000);
            }
        });
    }

    // --- 6. Anchor Scroll Fix (Kept for completeness) ---
    const ourStoryLinks = document.querySelectorAll('.nav-items a[href="index.html#our-story-anchor"]');
    if (ourStoryLinks.length > 0) {
        ourStoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const isCurrentPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

                if (isCurrentPage) {
                    e.preventDefault();
                    const targetElement = document.getElementById('our-story-anchor');
                    if (targetElement) {
                        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140; 
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                } 
            });
        });
        
        if (window.location.hash === '#our-story-anchor') {
            const targetElement = document.getElementById('our-story-anchor');
            if (targetElement) {
                setTimeout(() => {
                    const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }, 100); 
            }
        }
    }


    // --- 7. Collection Page (Price Slider) ---
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    if (priceSlider && priceValue) {
        priceValue.textContent = priceSlider.value; 
        priceSlider.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }


    // Initial setup calls
    checkAuthStatus();
    fetchCart();
});// Frontend/script.js (COMPLETE FIXED VERSION)

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and Constants ---
    const API_BASE = '/api';
    const loginPanel = document.getElementById('login-panel');
    const contactPanel = document.getElementById('contact-panel');
    const cartPanel = document.getElementById('cart-panel');

    // UI Elements
    const loginIcon = document.getElementById('login-icon'); 
    const logoutBtn = document.getElementById('logout-btn'); 
    const userNameDisplay = document.getElementById('user-name-display'); 
    const authPanelTitle = document.getElementById('auth-panel-title');

    // Cart elements setup (needs to handle case where element might not exist on all pages)
    const cartIcon = document.querySelector('.nav-right .cart');
    let cartCountElement;
    if (cartIcon) {
        cartCountElement = document.createElement('span'); 
        cartCountElement.classList.add('cart-count');
        cartCountElement.textContent = '0';
        cartIcon.appendChild(cartCountElement);
    }
    
    // Forms and Panels (check for existence)
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const contactForm = document.querySelector('.contact-form');
    const newsletterForm = document.querySelector('.footer-newsletter form');
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartMessageArea = document.getElementById('cart-message-area');

    // Contact links
    const navContactLinks = document.querySelectorAll('.nav-items a[href="#"], .footer-links a[href=""]');
    const closeButtons = document.querySelectorAll('.auth-panel .close-btn');

    // --- Helper Functions ---

    function togglePanel(panel, show) {
        if (panel) {
            panel.style.display = show ? 'flex' : 'none';
            if (show && panel === cartPanel && cartItemsContainer) {
                fetchCart();
            }
            if (!show) {
                document.querySelectorAll('.form-message').forEach(el => el.textContent = '');
                if (cartMessageArea) {
                    cartMessageArea.textContent = '';
                    cartMessageArea.classList.remove('success-message', 'error-message');
                }
            }
        }
    }

    async function postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
    
    async function fetchData(url) {
        const response = await fetch(url);
        return response.json();
    }

    function updateCartDisplay(cart) {
        if (!cartItemsContainer) return;

        let total = 0;
        let count = 0;
        cartItemsContainer.innerHTML = '';
        
        if (cart && cart.items && cart.items.length > 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            
            cart.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                count += item.quantity;
                
                const itemImageSrc = item.image.startsWith('Assets/') ? `../${item.image}` : `../Assets/${item.image}`;
                
                const itemHTML = `
                    <div class="cart-item">
                        <img src="${itemImageSrc}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price-qty">₹${item.price.toFixed(2)} x ${item.quantity} = ₹${itemTotal.toFixed(2)}</p>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            });
            
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.style.display = 'block';
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.style.display = 'none';
        }
        
        if (document.getElementById('cart-panel-title')) document.getElementById('cart-panel-title').textContent = `Your Shopping Cart (${count} Items)`;
        if (cartSubtotal) cartSubtotal.textContent = `₹${total.toFixed(2)}`;
        if (cartCountElement) cartCountElement.textContent = count;
    }
    
    async function fetchCart() {
        try {
            const result = await fetchData(`${API_BASE}/cart`);
            if (result.success) {
                updateCartDisplay(result.cart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }
    
    // --- Authentication State Management ---

    function checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const isLoggedIn = !!user;

        // Toggling visibility of login icon, username, and logout button
        if (loginIcon) loginIcon.classList.toggle('hidden', isLoggedIn);
        if (userNameDisplay) userNameDisplay.classList.toggle('hidden', !isLoggedIn);
        if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);

        if (isLoggedIn && userNameDisplay && user.name) {
            userNameDisplay.textContent = `Hi, ${user.name.split(' ')[0]}!`;
        }
    }

    function loginUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkAuthStatus();
    }

    function logoutUser() {
        localStorage.removeItem('currentUser');
        checkAuthStatus();
        alert('You have been logged out.');
        fetchCart(); 
    }
    
    // --- Cart/Checkout View Toggling ---

    function showCheckoutView() {
        if (!cartItemsContainer || !cartSubtotal || !proceedToCheckoutBtn || !emptyCartMessage || !backToCartBtn || !checkoutForm) return;

        document.getElementById('cart-panel-title').textContent = 'Confirm Order & Shipping';
        cartItemsContainer.classList.add('hidden');
        cartSubtotal.closest('.cart-summary').classList.add('hidden');
        proceedToCheckoutBtn.classList.add('hidden');
        emptyCartMessage.classList.add('hidden');
        
        backToCartBtn.classList.remove('hidden');
        checkoutForm.classList.remove('hidden');
    }

    function showCartView() {
        if (!cartItemsContainer || !cartSubtotal || !emptyCartMessage || !backToCartBtn || !checkoutForm) return;
        
        if (cartMessageArea) {
             cartMessageArea.textContent = '';
             cartMessageArea.classList.remove('success-message', 'error-message');
        }
        
        document.getElementById('cart-panel-title').textContent = 'Your Shopping Cart';
        cartItemsContainer.classList.remove('hidden');
        cartSubtotal.closest('.cart-summary').classList.remove('hidden');
        emptyCartMessage.classList.remove('hidden');
        
        backToCartBtn.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        
        fetchCart(); 
    }


    // --- 1. Panel/Modal Listeners ---

    // FIX: Listener added directly to the login icon (I tag) for clickability
    if (loginIcon) {
        loginIcon.addEventListener('click', () => {
            if (authPanelTitle) authPanelTitle.textContent = 'Welcome Back!';
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
            togglePanel(loginPanel, true);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // FIX: Listener added directly to the cart container (.cart) for clickability
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            togglePanel(cartPanel, true);
        });
    }

    navContactLinks.forEach(link => {
        if (link.textContent.includes('Contact')) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                togglePanel(contactPanel, true);
            });
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.closest('.auth-panel');
            togglePanel(panel, false);
            if (panel === cartPanel) {
                showCartView();
            }
        });
    });

    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                togglePanel(panel, false);
                if (panel === cartPanel) {
                    showCartView();
                }
            }
        });
    });

    // --- 2. Auth Panel Form Switching Logic (Fixed redundant h3) ---

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
            if (authPanelTitle) authPanelTitle.textContent = 'Create Account';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
            if (authPanelTitle) authPanelTitle.textContent = 'Welcome Back!';
        });
    }


    // --- 3. Form Submission Handling (Auth, Contact, Newsletter) ---

    function displayFormMessage(form, message, isSuccess) {
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.classList.add('form-message');
            // Append message element inside the form/parent for better visual placement
            const submitButton = form.querySelector('.auth-button, button[type="submit"]');
            if (submitButton && submitButton.parentNode) {
                 submitButton.parentNode.insertBefore(messageElement, submitButton.nextSibling);
            } else {
                 form.appendChild(messageElement);
            }
        }
        messageElement.classList.remove('success-message', 'error-message');
        messageElement.classList.add(isSuccess ? 'success-message' : 'error-message');
        messageElement.textContent = message;
        
        setTimeout(() => messageElement.textContent = '', 3000); 
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.elements[0].value;
            const password = loginForm.elements[1].value;
            const result = await postData(`${API_BASE}/login`, { email, password });
            displayFormMessage(loginForm, result.message, result.success);
            if (result.success) {
                loginUser(result.user);
                setTimeout(() => togglePanel(loginPanel, false), 1000);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = registerForm.elements[0].value;
            const email = registerForm.elements[1].value;
            const password = registerForm.elements[2].value;
            const confirmPassword = registerForm.elements[3].value; // Ensure you have a 4th element in your HTML

            if (password !== confirmPassword) {
                return displayFormMessage(registerForm, 'Passwords do not match.', false);
            }

            const result = await postData(`${API_BASE}/register`, { fullName, email, password });
            displayFormMessage(registerForm, result.message, result.success);
            if (result.success) {
                registerForm.reset();
                setTimeout(() => {
                    if (showLoginLink) showLoginLink.click();
                }, 1500);
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = contactForm.elements[0].value;
            const email = contactForm.elements[1].value;
            const message = contactForm.elements[2].value;

            const result = await postData(`${API_BASE}/contact`, { name, email, message });
            displayFormMessage(contactForm, result.message, result.success);
            contactForm.reset();
            if (result.success) {
                 setTimeout(() => togglePanel(contactPanel, false), 1500);
            }
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            const result = await postData(`${API_BASE}/subscribe`, { email });
            displayFormMessage(newsletterForm, result.message, result.success);
            newsletterForm.reset();
        });
    }


    // --- 4. Cart Logic (Add to Cart FIX) ---

    document.body.addEventListener('click', async (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small')) {
            e.preventDefault();
            
            const targetElement = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small');
            const card = targetElement.closest('.product-card') || targetElement.closest('.product-card-small');
            if (!card) return;

            const isBulk = targetElement.classList.contains('add-to-cart-btn-gold');
            
            if (isBulk) {
                togglePanel(contactPanel, true);
                return;
            }

            const isSmall = card.classList.contains('product-card-small');
            const infoContainer = card.querySelector(isSmall ? '.card-info-small' : '.card-info');
            
            const nameElement = infoContainer.querySelector(isSmall ? '.product-name-small' : '.product-name');
            const priceElement = infoContainer.querySelector(isSmall ? '.product-price-small' : '.product-price');
            const imageElement = card.querySelector('img');

            if (!nameElement || !priceElement || !imageElement) {
                console.error("Missing product data elements.");
                return;
            }

            const name = nameElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            const imagePath = imageElement.getAttribute('src');
            
            // FIX: Robustly parse the price by stripping all non-digit/non-dot characters
            // The backend already expects a clean number string, but this double-checks and cleans the frontend data.
            const rawPrice = priceText.replace(/[^0-9.]/g, '').replace(/,/g, '');
            
            const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'index';
            const uniqueProductId = `${currentPage.toUpperCase()}_${name.split(' ').slice(0, 2).join('_').toUpperCase()}`; 
            
            const cleanImagePath = imagePath.replace('../', ''); 
            
            const productData = {
                product_id: uniqueProductId,
                name: name,
                price: rawPrice, // Sending cleaned numerical string
                image: cleanImagePath,
                quantity: 1 
            };

            try {
                const result = await postData(`${API_BASE}/cart/add`, productData);
                if (result.success) {
                    updateCartDisplay(result.cart);
                    if(cartCountElement) cartCountElement.textContent = result.cartCount;
                    if(cartIcon) {
                        cartIcon.style.transform = 'scale(1.2)';
                        setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
                    }
                } else {
                    console.error('Cart API Error:', result.message);
                }
            } catch (error) {
                console.error('Add to Cart Fetch Error:', error);
            }
        }
    });

    // --- 5. Checkout Logic (Kept for completeness) ---

    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', showCheckoutView);
    }
    
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', showCartView);
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(checkoutForm);
            const data = Object.fromEntries(formData.entries());
            
            if (!/^[0-9]{6}$/.test(data.pincode)) {
                if (cartMessageArea) {
                    cartMessageArea.textContent = 'Error: Pincode must be 6 digits.';
                    cartMessageArea.classList.add('error-message');
                }
                return;
            }
            if (!/^[0-9]{10}$/.test(data.mobile)) {
                if (cartMessageArea) {
                    cartMessageArea.textContent = 'Error: Mobile number must be 10 digits.';
                    cartMessageArea.classList.add('error-message');
                }
                return;
            }

            if (cartMessageArea) {
                cartMessageArea.textContent = 'Processing order...';
                cartMessageArea.classList.remove('success-message', 'error-message');
            }

            const result = await postData(`${API_BASE}/checkout`, data);

            if (cartMessageArea) {
                 cartMessageArea.textContent = result.message;
                 cartMessageArea.classList.add(result.success ? 'success-message' : 'error-message');
            }

            if (result.success) {
                if (cartCountElement) cartCountElement.textContent = '0';
                checkoutForm.reset();
                
                setTimeout(() => {
                    showCartView(); 
                    togglePanel(cartPanel, false);
                }, 4000);
            }
        });
    }

    // --- 6. Anchor Scroll Fix for "Our Story" (Cross-page fix) ---
    
    const ourStoryLinks = document.querySelectorAll('.nav-items a[href="index.html#our-story-anchor"]');
    if (ourStoryLinks.length > 0) {
        ourStoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const isCurrentPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

                if (isCurrentPage) {
                    e.preventDefault();
                    const targetElement = document.getElementById('our-story-anchor');
                    if (targetElement) {
                        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140; 
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                } 
            });
        });
        
        if (window.location.hash === '#our-story-anchor') {
            const targetElement = document.getElementById('our-story-anchor');
            if (targetElement) {
                setTimeout(() => {
                    const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }, 100); 
            }
        }
    }


    // --- 7. Collection Page (Price Slider) ---
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    if (priceSlider && priceValue) {
        priceValue.textContent = priceSlider.value; 
        priceSlider.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }


    // Initial setup calls
    checkAuthStatus();
    fetchCart();
});