// backend/db.js

/**
 * Mock Database for SN Candles.
 * In a production environment, this would be replaced by a proper database (e.g., MongoDB, PostgreSQL)
 * and passwords would be securely hashed (e.g., using bcrypt).
 */
const db = {
    // Stores mock user data: { id, name, email, password }
    users: [
        { id: 1, name: 'Admin User', email: 'admin@sncandles.com', password: 'password123' }
    ],
    
    // Stores mock subscribed emails
    subscriptions: [],
    
    // Stores mock cart items
    cart: {
        items: [], // [{ product_id: 'CANDLE_001', name: 'Product Name', price: 500, quantity: 1, image: '...' }]
        cartId: 'MOCK_CART_001'
    }
};

module.exports = db;