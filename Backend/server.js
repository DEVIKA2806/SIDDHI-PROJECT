// backend/server.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Define the root directory of the entire project (one level up from /backend)
const projectRoot = path.join(__dirname, '..');

// --- 1. Middleware Setup ---

// Serve static files from the 'Frontend' directory
// Path adjustment: Go up one level (..) to the project root, then into 'Frontend'
app.use(express.static(path.join(projectRoot, 'Frontend')));

// Serve static files (images, logos) from the 'Assets' directory
// This maps requests starting with '/Assets' to the actual 'Assets' folder
app.use('/Assets', express.static(path.join(projectRoot, 'Assets')));

// Enable parsing of JSON and URL-encoded data for form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 2. Route Handling ---

// Root route: Serve index.html when someone accesses the base URL
app.get('/', (req, res) => {
    // path.join(projectRoot, 'Frontend', 'index.html') creates the full path
    res.sendFile(path.join(projectRoot, 'Frontend', 'index.html'));
});

// Placeholder for handling form submissions
app.post('/api/login', (req, res) => {
    console.log('Login attempt received:', req.body);
    // In a real application, you would add database logic here.
    res.status(200).send({ message: 'Login request processed successfully (placeholder)' });
});

app.post('/api/contact', (req, res) => {
    console.log('Contact form submission received:', req.body);
    // In a real application, you would send an email here.
    res.status(200).send({ message: 'Contact message received. We will be in touch!' });
});


// --- 3. Start Server ---

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving front-end from: ${path.join(projectRoot, 'Frontend')}`);
});