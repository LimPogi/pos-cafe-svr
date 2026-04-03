const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*' // This allows any website to talk to your API. Good for testing!
}));
// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. IMPORT ROUTES (Make sure these only appear ONCE)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

// 3. USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 4. BASE ROUTE
app.get('/', (req, res) => {
    res.send('POS Cafe Backend is Live and Smelling like Coffee! ☕');
});

// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});