const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// 1. GET: Fetch all products
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. POST: Add new product
router.post('/', verifyToken, async (req, res) => {
    const { name, price, category, stock_quantity } = req.body;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ 
                name, 
                price: parseFloat(price), 
                category, 
                stock_quantity: parseInt(stock_quantity) 
            }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. PUT: Update an existing product
router.put('/:id', verifyToken, async (req, res) => {
    const { name, price, category, stock_quantity } = req.body;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .update({ 
                name, 
                price: parseFloat(price), 
                category, 
                stock_quantity: parseInt(stock_quantity) 
            })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. DELETE: Remove a product
router.delete('/:id', verifyToken, async (req, res) => {
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); // Fixed the missing closing here

module.exports = router;