const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); // NEW
const orderRoutes = require('./routes/orders');   // NEW

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // NEW
app.use('/api/orders', orderRoutes);     // NEW
const app = express();
app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('POS Cafe Backend is running! ☕');
});

// --- NEW CODE STARTS HERE ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); 
// --- NEW CODE ENDS HERE ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});