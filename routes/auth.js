const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, password, roles } = req.body;
    try {
        const user = await User.create({ username, password, roles });
        res.status(201).json({ message: 'User created', username: user.username, roles: user.roles });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Username already exists' });
        if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
        res.sendStatus(500);
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, username: user.username, roles: user.roles };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        const payload = { id: user._id, username: user.username, roles: user.roles };
        const accessToken = generateAccessToken(payload);
        res.json({ accessToken });
    });
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(400);

    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(204);

    user.refreshToken = null;
    await user.save();
    res.sendStatus(204);
});

module.exports = router;
