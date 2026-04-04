const supabase = require('../config/supabase');

exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, stock_quantity } = req.body;

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
};

exports.getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};