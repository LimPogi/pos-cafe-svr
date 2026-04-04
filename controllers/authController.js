const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: "Invalid credentials" });

    // 2. Fetch the user's role from your custom 'users' table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || profile.role !== role) {
      return res.status(403).json({ error: `Account not authorized for ${role} portal.` });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: profile.id, role: profile.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: profile // This sends id, email, and role to the frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};