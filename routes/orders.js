const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// POST: Create a new order
router.post('/', verifyToken, async (req, res) => {
    const { items, total_price } = req.body;
    const userId = req.user.id;

    try {
        // 1. Save the main order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{ user_id: userId, total_price }])
            .select();

        if (orderError) throw orderError;
        const orderId = order[0].id;

        // 2. Process each item: Save record AND Deduct Stock
        for (const item of items) {
            // Save to order_items table
            await supabase.from('order_items').insert([{
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }]);

            // DEDUCT STOCK: This is the new logic
            // We tell Supabase: "Set stock_quantity to (current stock - quantity bought)"
            const { data: product } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();

            await supabase
                .from('products')
                .update({ stock_quantity: product.stock_quantity - item.quantity })
                .eq('id', item.id);
        }

        res.status(201).json({ message: 'Order placed and stock updated! 📉' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;