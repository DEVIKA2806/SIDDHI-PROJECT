// Frontend/script.js (NEW & EXPANDED)

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and Constants ---
    const API_BASE = '/api';
    const loginPanel = document.getElementById('login-panel');
    const contactPanel = document.getElementById('contact-panel');
    
    // --- NEW: Cart Panel Elements ---
    const cartPanel = document.getElementById('cart-panel');
    const cartIcon = document.querySelector('.nav-right .cart');
    const cartCountElement = document.createElement('span'); 
    cartCountElement.classList.add('cart-count');
    cartCountElement.textContent = '0';
    cartIcon.appendChild(cartCountElement);
    
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartMessageArea = document.getElementById('cart-message-area');
    // ------------------------------------

    const closeButtons = document.querySelectorAll('.auth-panel .close-btn');
    
    // Auth Panel Forms and Links
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // Contact & Newsletter Forms
    const contactForm = document.querySelector('.contact-form');
    const newsletterForm = document.querySelector('.footer-newsletter form');

    // --- Helper Functions ---

    function togglePanel(panel, show) {
        if (panel) {
            panel.style.display = show ? 'flex' : 'none';
            if (show && panel === cartPanel) {
                fetchCart(); // Fetch cart items immediately when opening the cart
            }
            // Clear message area on close
            if (!show) {
                cartMessageArea.textContent = '';
                cartMessageArea.classList.remove('success-message', 'error-message');
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
        let total = 0;
        let count = 0;
        cartItemsContainer.innerHTML = '';
        
        if (cart && cart.items && cart.items.length > 0) {
            emptyCartMessage.style.display = 'none';
            
            cart.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                count += item.quantity;
                
                // Note: Image path needs to be correct for the browser
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
            
            proceedToCheckoutBtn.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'block';
            proceedToCheckoutBtn.style.display = 'none';
        }
        
        document.getElementById('cart-panel-title').textContent = `Your Shopping Cart (${count} Items)`;
        cartSubtotal.textContent = `₹${total.toFixed(2)}`;
        cartCountElement.textContent = count;
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
    
    function showCheckoutView() {
        document.getElementById('cart-panel-title').textContent = 'Confirm Order & Shipping';
        cartItemsContainer.classList.add('hidden');
        cartSubtotal.closest('.cart-summary').classList.add('hidden');
        proceedToCheckoutBtn.classList.add('hidden');
        emptyCartMessage.classList.add('hidden');
        
        backToCartBtn.classList.remove('hidden');
        checkoutForm.classList.remove('hidden');
    }

    function showCartView() {
        // Clear message area
        cartMessageArea.textContent = '';
        cartMessageArea.classList.remove('success-message', 'error-message');
        
        // Reset to cart view structure
        document.getElementById('cart-panel-title').textContent = 'Your Shopping Cart';
        cartItemsContainer.classList.remove('hidden');
        cartSubtotal.closest('.cart-summary').classList.remove('hidden');
        emptyCartMessage.classList.remove('hidden');
        
        backToCartBtn.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        
        // Buttons should be re-enabled by fetchCart based on if there are items
        fetchCart(); 
    }


    // --- 1. Panel/Modal Functionality (Open/Close) ---

    if (document.querySelector('.nav-right .login')) {
        document.querySelector('.nav-right .login').addEventListener('click', () => {
            togglePanel(loginPanel, true);
        });
    }
    
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            togglePanel(cartPanel, true);
        });
    }

    const navContactLinks = document.querySelectorAll('.nav-items a[href="#"], .footer-links a[href="#"]');
    navContactLinks.forEach(link => {
        if (link.textContent.includes('Contact Us') || link.textContent.includes('Contact')) {
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

    // --- 2. Auth Panel Form Switching Logic ---

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            document.querySelector('#login-panel h3').textContent = 'Create Account';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            document.querySelector('#login-panel h3').textContent = 'Welcome Back!';
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
        
        setTimeout(() => messageElement.remove(), 3000);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.elements[0].value;
            const password = loginForm.elements[1].value;
            const result = await postData(`${API_BASE}/login`, { email, password });
            displayFormMessage(loginForm, result.message, result.success);
            if (result.success) {
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
            const result = await postData(`${API_BASE}/register`, { fullName, email, password });
            displayFormMessage(registerForm, result.message, result.success);
            if (result.success) {
                registerForm.reset();
                setTimeout(() => showLoginLink.click(), 1500);
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
            // Requested action: "come back to the website page" (i.e. close the modal)
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

    // --- 4. Cart Logic (Add to Cart) ---

    document.body.addEventListener('click', async (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small')) {
            e.preventDefault();
            
            const targetElement = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small');
            const card = targetElement.closest('.product-card') || targetElement.closest('.product-card-small');
            if (!card) return;

            const isBulk = targetElement.classList.contains('add-to-cart-btn-gold');
            
            if (isBulk) {
                // For bulk orders, direct to contact form
                togglePanel(contactPanel, true);
                return;
            }

            const isSmall = card.classList.contains('product-card-small');
            const infoContainer = card.querySelector(isSmall ? '.card-info-small' : '.card-info');
            
            const name = infoContainer.querySelector(isSmall ? '.product-name-small' : '.product-name').textContent.trim();
            const priceText = infoContainer.querySelector(isSmall ? '.product-price-small' : '.product-price').textContent.trim();
            const imagePath = card.querySelector('img').getAttribute('src');
            
            const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'index';
            const uniqueProductId = `${currentPage.toUpperCase()}_${name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;

            const cleanImagePath = imagePath.replace('../', ''); 

            const productData = {
                product_id: uniqueProductId,
                name: name,
                price: priceText,
                image: cleanImagePath,
                quantity: 1 
            };

            try {
                const result = await postData(`${API_BASE}/cart/add`, productData);
                if (result.success) {
                    updateCartDisplay(result.cart);
                    cartCountElement.textContent = result.cartCount;
                    // Simple animation for visual feedback of item added
                    cartIcon.style.transform = 'scale(1.2)';
                    setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
                }
            } catch (error) {
                console.error('Add to Cart Error:', error);
            }
        }
    });

    // --- 5. Checkout Logic ---

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
            
            // Client-side validation (backend will re-validate)
            if (!/^[0-9]{6}$/.test(data.pincode)) {
                cartMessageArea.textContent = 'Error: Pincode must be 6 digits.';
                cartMessageArea.classList.add('error-message');
                return;
            }
            if (!/^[0-9]{10}$/.test(data.mobile)) {
                cartMessageArea.textContent = 'Error: Mobile number must be 10 digits.';
                cartMessageArea.classList.add('error-message');
                return;
            }

            cartMessageArea.textContent = 'Processing order...';
            cartMessageArea.classList.remove('success-message', 'error-message');

            const result = await postData(`${API_BASE}/checkout`, data);

            cartMessageArea.textContent = result.message;
            cartMessageArea.classList.add(result.success ? 'success-message' : 'error-message');

            if (result.success) {
                // Clear cart icon count and reset form
                cartCountElement.textContent = '0';
                checkoutForm.reset();
                
                // Close panel and reset view after a delay
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
                        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140; // 140px offset for fixed nav
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                } 
                // If not on index.html, the browser navigates first, and the load-time scroll takes over (next block)
            });
        });
        
        // Scroll on load (after cross-page navigation completes)
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


    // --- 7. Collection Page (candles.html) Functionality (Price Slider) ---
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    if (priceSlider && priceValue) {
        priceValue.textContent = priceSlider.value; 
        priceSlider.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }

    // Initial cart load count
    fetchCart();
});