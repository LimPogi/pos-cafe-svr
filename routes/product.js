const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// GET: Fetch all products
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Add a new product (Protected)
router.post('/', verifyToken, async (req, res) => {
    const { name, price, category, stock_quantity } = req.body;
    
    // We convert to Uppercase to make sure 'admin' or 'Admin' both work
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
        return res.status(403).json({ error: 'Only Admins can add products!' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ 
                name, 
                price: parseFloat(price), 
                category: category || 'General', 
                stock_quantity: parseInt(stock_quantity) 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error("Supabase Insert Error:", error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;