const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation: If role is missing, that's why you get a 400
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: "Invalid email or password." });

    // 2. Check the role in your public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || userProfile.role !== role) {
      return res.status(403).json({ error: `This account is not authorized as a ${role}.` });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: userProfile });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};