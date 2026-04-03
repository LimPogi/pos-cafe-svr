const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Look for the token in the request headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format is usually "Bearer [token]"

    // 2. If there is no token, kick them out
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided. 🛑' });
    }

    try {
        // 3. Verify the token using our secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the user's info (like their role) to the request
        next(); // Let them pass to the next route!
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;