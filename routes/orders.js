const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, async (req, res) => {
    const { items, total_price } = req.body;
    const userId = req.user.id;

    try {
        // 1. Create Main Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{ user_id: userId, total_price }])
            .select();

        if (orderError) throw orderError;
        const orderId = order[0].id;

        // 2. Loop through items to insert details and update stock
        for (const item of items) {
            // Insert into order_items
            const { error: itemError } = await supabase.from('order_items').insert([{
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }]);
            if (itemError) throw itemError;

            // Fetch current stock
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();
            if (fetchError) throw fetchError;

            // Deduct stock
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock_quantity: product.stock_quantity - item.quantity })
                .eq('id', item.id);
            if (updateError) throw updateError;
        }

        res.status(201).json({ message: 'Order successful!' });
    } catch (error) {
        console.error("ORDER ERROR:", error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;