// backend/server.js (UPDATED with all logic)

const express = require('express');
const path = require('path');
const db = require('./db'); // Import the mock database
const app = express();
const PORT = process.env.PORT || 3000;

// Define the root directory of the entire project (one level up from /backend)
const projectRoot = path.join(__dirname, '..');

// --- 1. Middleware Setup ---

app.use(express.static(path.join(projectRoot, 'Frontend')));
app.use('/Assets', express.static(path.join(projectRoot, 'Assets')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 2. Authentication Routes (Login/Register) ---

app.post('/api/register', (req, res) => {
    const { fullName, email, password } = req.body;

    // Requested action: "whenever already logged in user try to open new account with that same credentials give a message saying 'this account already exists'"
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'This account already exists. Please log in.' });
    }

    const newUser = { 
        id: db.users.length + 1, 
        name: fullName, 
        email, 
        password // Mock password storage - MUST be HASHED in production
    };
    db.users.push(newUser);
    console.log('New user registered:', newUser.email);
    res.status(201).json({ success: true, message: 'Account created successfully! Please log in.', user: { id: newUser.id, name: newUser.name } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        // In a real app, set a session or JWT token here
        console.log('User logged in:', user.email);
        res.status(200).json({ success: true, message: `Welcome back, ${user.name}!`, user: { id: user.id, name: user.name } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});


// --- 3. Shopping Cart Routes (Add to Cart, Fetch Cart) ---

app.get('/api/cart', (req, res) => {
    const cartCount = db.cart.items.reduce((total, item) => total + item.quantity, 0);
    res.status(200).json({ success: true, cart: db.cart, cartCount });
});

app.post('/api/cart/add', (req, res) => {
    const { product_id, name, price, image, quantity } = req.body;

    const itemPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const itemQuantity = parseInt(quantity);
    
    // Check if item already exists in cart to update quantity
    const existingItem = db.cart.items.find(item => item.product_id === product_id);
    
    if (existingItem) {
        existingItem.quantity += itemQuantity;
    } else {
        db.cart.items.push({ 
            product_id, 
            name, 
            price: itemPrice, 
            image, 
            quantity: itemQuantity 
        });
    }
    
    const cartCount = db.cart.items.reduce((total, item) => total + item.quantity, 0);

    res.status(200).json({ 
        success: true, 
        message: `${name} added to cart!`,
        cart: db.cart,
        cartCount: cartCount
    });
});


// --- 4. Forms Routes (Contact, Newsletter) ---

app.post('/api/contact', (req, res) => {
    // Requested action: "give message back saying 'message sent successfully'"
    console.log('New Contact Message:', req.body);
    // In a real app, send an email here using a service like Nodemailer
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
});

app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (db.subscriptions.includes(email)) {
        return res.status(200).json({ success: true, message: 'You are already a member of the Glow Club!' });
    }
    
    db.subscriptions.push(email);
    console.log(`New subscription: ${email}`);
    res.status(200).json({ success: true, message: 'Thank you for joining the Glow Club! You are now subscribed.' });
});


// --- 5. Checkout Route ---

app.post('/api/checkout', (req, res) => {
    const { name, mobile, pincode, address, paymentMethod } = req.body;
    
    if (db.cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty! Cannot place order.' });
    }
    
    // Simple mock validation for demonstration
    if (!/^[0-9]{6}$/.test(pincode)) {
        return res.status(400).json({ success: false, message: 'Invalid Pincode format (must be 6 digits).' });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ success: false, message: 'Invalid Mobile Number (must be 10 digits).' });
    }

    const order = {
        orderId: `SN-${Date.now().toString().slice(-6)}`,
        items: db.cart.items,
        total: db.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: { name, mobile, pincode, address },
        payment: { method: paymentMethod }
    };

    console.log('New Order Placed:', order.orderId);
    
    // Clear the cart
    db.cart.items = [];

    res.status(200).json({ 
        success: true, 
        message: `Order #${order.orderId} placed successfully! Thank you for your purchase.`,
        order 
    });
});


// --- 6. Fallback/Root Route ---

app.get('*', (req, res) => {
    const fileName = req.url === '/' ? 'index.html' : req.url;
    if (fileName.endsWith('.html')) {
        return res.sendFile(path.join(projectRoot, 'Frontend', fileName));
    }
    res.status(404).send('Page not found');
});


// --- 7. Start Server ---

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});