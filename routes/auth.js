const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db'); // Our database connection

// POST: Register a new user (Admin/Cashier)
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Scramble (hash) the password so it's not saved as plain text
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Save the new user to our Supabase 'users' table
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
        // 1. Find the user in the database by their email
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error || users.length === 0) {
            return res.status(400).json({ error: 'User not found 🕵️‍♂️' });
        }
        
        const user = users[0];

        // 2. Compare the typed password with the scrambled one in the database
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password 🔑' });
        }

        // 3. Create the JWT digital ID card
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // 4. Send the token and user info back to the frontend
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;