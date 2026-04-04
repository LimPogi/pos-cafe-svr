const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// --- 1. STAFF REGISTRATION (Admin Only Logic) ---
router.post('/register-staff', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                name, 
                email, 
                password: hashedPassword, 
                role: role || 'cashier' // Default to cashier
            }])
            .select();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Email already exists! 📧' });
            throw error;
        }

        res.status(201).json({ message: 'Staff created successfully! 🎉', user: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- 2. GENERAL REGISTRATION (For your initial Admin setup) ---
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

// --- 3. LOGIN (Updated with Role Verification) ---
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body; // Added role to the request

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', role); // This ensures they are logging into the right portal

        if (error || !users || users.length === 0) {
            return res.status(400).json({ error: `User not found in ${role} records 🕵️‍♂️` });
        }
        
        const user = users[0];

        // Password Check
        let isMatch = await bcrypt.compare(password, user.password);
        
        // Backup plain text check (Only if you have old unhashed users)
        if (!isMatch) {
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password 🔑' });
        }

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