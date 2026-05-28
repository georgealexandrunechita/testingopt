require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Character = require('./models/Character');
const { connectDB } = require('./db');
const authRouter = require('./routes/auth');
const { verifyToken, requireRole } = require('./middleware/auth');
const logger = require('./logger');

connectDB();

app.use(express.json());
app.use(express.urlencoded());
app.use(logger.middleware());
app.set('view engine', 'pug');
app.set('views', './views');

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 1 = connected
    const dbOk = dbState === 1;
    const status = dbOk ? 'ok' : 'degraded';
    const httpStatus = dbOk ? 200 : 503;

    const payload = {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown',
            ok: dbOk
        }
    };

    if (dbOk) {
        logger.info('health check passed', payload);
    } else {
        logger.warn('health check degraded', payload);
    }

    res.status(httpStatus).json(payload);
});

// ── Auth routes (public) ──────────────────────────────────────────────────────
app.use('/auth', authRouter);

// ── Characters ────────────────────────────────────────────────────────────────
app.get('/characters', verifyToken, async (req, res) => {
    const resultado = await Character.find();
    res.send(resultado);
});

app.get('/characters/:id', verifyToken, async (req, res) => {
    const resultado = await Character.findById(req.params.id);
    if (!resultado) return res.sendStatus(404);
    res.send(resultado);
});

app.post('/characters', verifyToken, requireRole('admin'), async (req, res) => {
    const c = req.body;
    const existe = await Character.findOne({ name: c.name });
    if (existe) return res.sendStatus(400);
    try {
        const resultado = await Character.create(c);
        logger.info('character created', { id: resultado._id, name: resultado.name });
        res.status(201).send(resultado);
    } catch (err) {
        if (err.name === 'ValidationError') {
            logger.warn('character validation error', { error: err.message });
            res.status(400).send(err.message);
        }
    }
});

app.put('/characters/:id', verifyToken, requireRole('admin'), async (req, res) => {
    const c = req.body;
    const existe = await Character.findOne({ name: c.name, _id: { $ne: req.params.id } });
    if (existe) return res.sendStatus(400);
    try {
        const resultado = await Character.findByIdAndUpdate(
            req.params.id,
            { ...req.body, $inc: { '__v': 1 } },
            { runValidators: true }
        );
        if (!resultado) return res.sendStatus(404);
        logger.info('character updated', { id: req.params.id });
        res.sendStatus(204);
    } catch (err) {
        if (err.name === 'ValidationError') {
            logger.warn('character update validation error', { error: err.message });
            res.status(400).send(err.message);
        }
    }
});

app.delete('/characters/:id', verifyToken, requireRole('admin'), async (req, res) => {
    const resultado = await Character.findByIdAndDelete(req.params.id);
    if (!resultado) return res.sendStatus(404);
    logger.info('character deleted', { id: req.params.id });
    res.sendStatus(204);
});

// ── Views ─────────────────────────────────────────────────────────────────────
app.get('/index', (req, res) => {
    res.render('index', { title: 'Welcome' });
});

app.get('/list', (req, res) => {
    res.render('list', { characters: [], title: 'Character list' });
});

app.get('/new', (req, res) => {
    res.render('new', { title: 'New character' });
});

app.post('/process', (req, res) => {
    res.redirect('/list');
});

// ── Start server (skipped when required by tests) ────────────────────────────
if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        logger.info('server started', { port: PORT });
    });
}

module.exports = app;
