/**
 * Frontend JavaScript for SN Candles E-commerce site (script.js)
 * * Handles modal functionality (Login/Register, Contact) and UI elements (Price Slider).
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Panel/Modal Functionality ---

    const loginPanel = document.getElementById('login-panel');
    const contactPanel = document.getElementById('contact-panel');
    const loginIcon = document.querySelector('.nav-right .login');
    const closeButtons = document.querySelectorAll('.auth-panel .close-btn');
    
    // Forms and Switch Links inside the Login Panel
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Navigation "Contact Us" links (in nav and footer)
    const navContactLinks = document.querySelectorAll('.nav-items a[href="#"], .footer-links a[href="#"]');

    /**
     * Toggles the display of a modal panel.
     * @param {HTMLElement} panel - The modal element to show/hide.
     * @param {boolean} show - True to show the panel, false to hide.
     */
    function togglePanel(panel, show) {
        if (panel) {
            panel.style.display = show ? 'flex' : 'none';
        }
    }

    // --- A. Login Panel Logic ---

    // Open Login Panel
    if (loginIcon) {
        loginIcon.addEventListener('click', () => {
            togglePanel(loginPanel, true);
        });
    }

    // Switch to Register form
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            document.querySelector('#login-panel h3').textContent = 'Create Account';
        });
    }

    // Switch back to Login form
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            document.querySelector('#login-panel h3').textContent = 'Welcome Back!';
        });
    }

    // --- B. Contact Panel Logic (Triggered by Navigation Link) ---
    navContactLinks.forEach(link => {
        // We target the link that doesn't have a specific page (i.e., href="#")
        if (link.textContent.includes('Contact Us') || link.textContent.includes('Contact')) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Stop the link from navigating/scrolling
                togglePanel(contactPanel, true);
            });
        }
    });

    // --- C. Close Panel Logic (Global) ---
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.closest('.auth-panel');
            togglePanel(panel, false);
        });
    });

    // Close panel when clicking outside the content box
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                togglePanel(panel, false);
            }
        });
    });

    // --- 2. Collection Page (candles.html) Functionality ---
    
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    if (priceSlider && priceValue) {
        // Initialize the value on page load
        priceValue.textContent = priceSlider.value; 

        // Update value as the slider is dragged
        priceSlider.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }

    // --- 3. Anchor Scroll Fix for "Our Story" ---
    
    // Fixes the issue where fixed navbar overlaps anchor target
    const ourStoryLink = document.querySelector('.nav-items a[href*="our-story-anchor"]');
    if (ourStoryLink) {
        ourStoryLink.addEventListener('click', function(e) {
            // Only handle internal links to #our-story-anchor on the current page
            if (this.pathname === window.location.pathname && this.hash) {
                e.preventDefault();
                const targetId = this.hash;
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Calculate offset to account for the fixed navbar height (110px + 30px = 140px)
                    const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 140;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
});