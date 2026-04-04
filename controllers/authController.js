const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }

    // 1. Sign in with Supabase Auth (Checks credentials)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 2. Fetch profile from public.users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({ error: "User profile not found. Please contact admin." });
    }

    // 3. Role Validation
    if (userProfile.role !== role) {
      return res.status(403).json({ error: `Access denied: Account is not assigned as ${role}.` });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    return res.json({ 
      message: "Login successful",
      token, 
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      } 
    });

  } catch (err) {
    console.error("Login Exception:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- REGISTER FUNCTION ---
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "All fields (email, password, role) are required." });
    }

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: "Registration failed. User might already exist." });
    }

    // 2. Insert into PUBLIC.USERS (NO PASSWORD COLUMN)
    // We only insert id, email, and role.
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
      console.error("Database Insert Error:", profileError.message);
      
      // OPTIONAL: If profile fails, you might want to delete the auth user 
      // but for now, we'll return an error so you can fix your table.
      return res.status(500).json({ 
        error: "Auth created but profile failed. Ensure 'users' table has no 'password' column." 
      });
    }

    return res.status(201).json({ 
      message: "Registration successful!", 
      user: profileData 
    });

  } catch (err) {
    console.error("Registration Exception:", err.message);
    return res.status(500).json({ error: "Internal Server Error during registration" });
  }
};