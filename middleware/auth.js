const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, 'secretkey', async (err, user) => {
        if (err) return res.status(403).json({ message: "Token is not valid" });

        const foundUser = await User.findByPk(user.userId);
        if (!foundUser) return res.status(404).json({ message: "User not found" });

        req.user = foundUser; // Attach the user to the request object
        next();
    });
};

module.exports = authenticateToken;
