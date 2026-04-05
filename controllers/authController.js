const supabase = require('../config/db'); 
const jwt = require('jsonwebtoken');

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // 🔍 DEBUG LOG (REMOVE LATER)
    console.log("LOGIN ATTEMPT:", { email, role });

    // ✅ STEP 1: Supabase Auth Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("SUPABASE LOGIN ERROR:", error.message);
      return res.status(401).json({ error: error.message }); // show real reason
    }

    // ✅ STEP 2: Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error("PROFILE ERROR:", profileError?.message);
      return res.status(404).json({ error: "User profile not found." });
    }

    // ✅ STEP 3: Role check
    if (userProfile.role !== role) {
      return res.status(403).json({ 
        error: `Access denied: Account is not a ${role}.` 
      });
    }

    // ✅ STEP 4: Generate token
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
    console.error("SERVER LOGIN ERROR:", err.message);
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

    console.log("REGISTER ATTEMPT:", { email, role });

    // ✅ STEP 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("AUTH ERROR:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: "User already exists or signup failed." });
    }

    // ⚠️ IMPORTANT: HANDLE EMAIL CONFIRMATION CASE
    if (!authData.session) {
      return res.status(200).json({
        message: "Account created. Please verify your email before logging in."
      });
    }

    // ✅ STEP 2: Insert into users table
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
      console.error("DB ERROR:", profileError.message);
      return res.status(500).json({ 
        error: "Auth created, but profile failed. Check DB table." 
      });
    }

    return res.status(201).json({ 
      message: "Registration successful!", 
      user: profileData 
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    return res.status(500).json({ error: "Server error during registration" });
  }
};
