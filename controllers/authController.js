// 1. Changed this to match your db.js file name
const supabase = require('../config/db'); 
const jwt = require('jsonwebtoken');

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // Authenticate with Supabase Auth (Handles the internal password check)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Fetch profile from our custom public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({ error: "User profile not found." });
    }

    // Verify role matches selection
    if (userProfile.role !== role) {
      return res.status(403).json({ error: `Access denied: Account is not a ${role}.` });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    return res.json({ 
      message: "Login successful",
      token, 
      user: userProfile 
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// --- REGISTER FUNCTION ---
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // 1. Create the user in Supabase Auth (Password is handled here ONLY)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });
    if (!authData.user) return res.status(400).json({ error: "User already exists." });

    // 2. Insert details into PUBLIC.USERS table
    // CRITICAL: Ensure 'password' is NOT in this list
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email: email, 
          name: name || '', 
          role: role 
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error("DB Error:", profileError.message);
      // If this fails, the 'password' column likely still exists in your Supabase table editor
      return res.status(500).json({ error: "Auth created, but profile failed. Check your table columns." });
    }

    return res.status(201).json({ 
      message: "Registration successful!", 
      user: profileData 
    });

  } catch (err) {
    console.error("Registration Error:", err.message);
    return res.status(500).json({ error: "Server error during registration" });
  }
};