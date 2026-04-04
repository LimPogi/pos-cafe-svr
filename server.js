const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*' // This allows any website to talk to your API. Good for testing!
}));
// 1. MIDDLEWARE
// Just use this once - it handles everything!
app.use(cors()); 
app.use(express.json());

// IMPORT ROUTES
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders'); // <--- CHECK!
const dashboardRoutes = require('./routes/dashboard');

// USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // <--- CHECK!
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('POS Cafe Backend is Live! ☕');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});