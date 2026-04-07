const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

router.get('/detailed-summary', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total_price, created_at');

        if (error) throw error;

        const now = new Date();

        // Replace your "const today" line with this:
        const today = new Date().toLocaleDateString('en-CA'); // Results in 'YYYY-MM-DD' in local time

        orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            // Convert the order's DB time to your local date string
            const orderDateStr = orderDate.toLocaleDateString('en-CA'); 
            const price = Number(order.total_price);

            totalRevenue += price;
            
            if (orderDateStr === today) dailySales += price;
            
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                monthlySales += price;
            }
        });

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let dailySales = 0;
        let monthlySales = 0;
        let totalRevenue = 0;

        orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const orderDateStr = orderDate.toISOString().split('T')[0];
            const price = Number(order.total_price);

            totalRevenue += price;
            
            // Check if it's today
            if (orderDateStr === today) dailySales += price;
            
            // Check if it's this month
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                monthlySales += price;
            }
        });

        res.json({
            totalRevenue: totalRevenue.toFixed(2),
            dailySales: dailySales.toFixed(2),
            monthlySales: monthlySales.toFixed(2),
            totalOrders: orders.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;