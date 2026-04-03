const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// POST: Register a new user
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
        res.status(201).json({ message: 'User created successfully! 🎉', user: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST: Login an existing user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error || !users || users.length === 0) {
            return res.status(400).json({ error: 'User not found 🕵️‍♂️' });
        }
        
        const user = users[0];

        // --- SMART PASSWORD CHECK ---
        // 1. Try Bcrypt check first
        let isMatch = await bcrypt.compare(password, user.password);
        
        // 2. If Bcrypt fails, try a simple Plain Text check (Emergency Backup)
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

        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;