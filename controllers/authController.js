const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // 1. Sign in with Supabase Auth (This checks the password)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: "Invalid email or password." });

    // 2. Fetch the profile from public.users to check the role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // 3. Verify the role matches the portal selected
    if (profileError || userProfile.role !== role) {
      return res.status(403).json({ error: `Access denied: Account is not authorized as ${role}.` });
    }

    // 4. Generate JWT for the frontend
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token, user: userProfile });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server Error during login" });
  }
};

// --- REGISTER FUNCTION ---
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 1. Create the user in Supabase Auth (Handles the password internally)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2. Create the user profile in your PUBLIC.USERS table
    // NOTICE: We do NOT include 'password' here. 
    // This prevents the "Could not find column password" error.
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email: email, 
          role: role 
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Profile Creation Error:", profileError.message);
      return res.status(500).json({ error: "User authenticated but profile creation failed." });
    }

    res.status(201).json({ message: "Registration successful!", user: profileData });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ error: "Server Error during registration" });
  }
};