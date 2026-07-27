const jwt = require('jsonwebtoken');

// Middleware: verifies JWT AND checks that the user has the 'admin' role
module.exports = function (req, res, next) {
    let token = req.header('auth-token') || req.header('token');
    if (!token) return res.status(401).send('Access Denied');

    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;

        if (verified.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
        }

        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
