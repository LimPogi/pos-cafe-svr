const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// GET: Fetch all cafe products (Public or logged in)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Add a new product (Protected: Only for Admins)
router.post('/', verifyToken, async (req, res) => {
    const { name, price, category, stock_quantity } = req.body;
    
    // Simple Role Check
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only Admins can add products!' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, price, category, stock_quantity }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const { name, price, category, stock_quantity } = req.body;

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, price, category, stock_quantity }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Product added! ☕', product: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
module.exports = router;