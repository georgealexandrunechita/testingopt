const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;
        next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.sendStatus(401);
        const hasRole = roles.some(role => req.user.roles.includes(role));
        if (!hasRole) return res.sendStatus(403);
        next();
    };
}

module.exports = { verifyToken, requireRole };
