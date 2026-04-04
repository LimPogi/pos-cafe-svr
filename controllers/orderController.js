const supabase = require('../config/supabase');

exports.createOrder = async (req, res) => {
  try {
    const { user_id, total_price, items } = req.body;

    // 1. Insert the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id, 
        total_price, 
        status: 'completed' 
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Prepare order items with the new order ID
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      subtotal: item.subtotal
    }));

    // 3. Insert into order_items (The SQL trigger handles stock reduction automatically)
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({ message: "Order placed successfully!", orderId: order.id });
  } catch (error) {
    console.error("Order Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};