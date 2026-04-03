const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// GET: Fetch sales stats (Protected: Admin Only)
router.get('/stats', verifyToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        // 1. Get all orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total_price, created_at');

        if (error) throw error;

        // 2. Calculate Total Revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);

        // 3. Calculate Total Orders
        const totalOrders = orders.length;

        res.json({
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders: totalOrders,
            recentOrders: orders.slice(-5) // Send last 5 orders for a "Recent Activity" list
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;