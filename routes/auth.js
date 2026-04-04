const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// --- 1. STAFF REGISTRATION (Admin Only Logic) ---
// This endpoint is called from your AdminDashboard.jsx
router.post('/register-staff', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    try {
        // 1. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Insert the new staff into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                name, 
                email, 
                password: hashedPassword, 
                role: role || 'cashier' // Default to cashier if not specified
            }])
            .select();

        // 3. Handle specific database errors
        if (error) {
            // Error code 23505 is a unique constraint violation (email already exists)
            if (error.code === '23505') {
                return res.status(400).json({ error: 'This email is already registered to a staff member! 📧' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Staff account created successfully! 🎉', user: data[0] });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(400).json({ error: error.message });
    }
});

// --- 2. GENERAL REGISTRATION (Initial Admin Setup) ---
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, role }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'User created successfully!', user: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- 3. LOGIN (With Portal-Specific Role Verification) ---
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body; 

    try {
        // Find the user by email AND role to prevent cross-portal login
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', role); 

        if (error || !users || users.length === 0) {
            return res.status(400).json({ error: `Account not found in the ${role} portal. 🕵️‍♂️` });
        }
        
        const user = users[0];

        // Verify password
        let isMatch = await bcrypt.compare(password, user.password);
        
        // Backup plain text check for older legacy users
        if (!isMatch) {
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password. 🔑' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: { id: user.id, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;