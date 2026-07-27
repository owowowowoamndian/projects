const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.header('auth-token') || req.header('token');
    if (!token) return res.status(401).send('Access Denied');

    // Strip "Bearer " if it was accidentally passed in
    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;
        console.log("Verified Token Payload:", verified); // Debug Log
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
