const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
aapp.use(cors({
  origin: "*", // for now (later restrict to your Vercel URL)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/', (req, res) => res.send('POS Backend is running!'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});