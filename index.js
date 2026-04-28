require('dotenv').config();
const express = require('express');
const app = express();
const Character = require('./models/Character');
const { connectDB } = require('./db');
const authRouter = require('./routes/auth');
const { verifyToken, requireRole } = require('./middleware/auth');

connectDB();

app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.set('views', './views');

// Auth routes (public)
app.use('/auth', authRouter);

// GET /characters — requiere login (cualquier rol)
app.get('/characters', verifyToken, async (req, res) => {
    const resultado = await Character.find();
    res.send(resultado);
});

// GET /characters/:id — requiere login (cualquier rol)
app.get('/characters/:id', verifyToken, async (req, res) => {
    const resultado = await Character.findById(req.params.id);
    if (!resultado) return res.sendStatus(404);
    res.send(resultado);
});

// POST /characters — requiere rol admin
app.post('/characters', verifyToken, requireRole('admin'), async (req, res) => {
    const c = req.body;
    const existe = await Character.findOne({ name: c.name });
    if (existe) return res.sendStatus(400);
    try {
        const resultado = await Character.create(c);
        res.status(201).send(resultado);
    } catch (err) {
        if (err.name === 'ValidationError') res.status(400).send(err.message);
    }
});

// PUT /characters/:id — requiere rol admin
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
        res.sendStatus(204);
    } catch (err) {
        if (err.name === 'ValidationError') res.status(400).send(err.message);
    }
});

// DELETE /characters/:id — requiere rol admin
app.delete('/characters/:id', verifyToken, requireRole('admin'), async (req, res) => {
    const resultado = await Character.findByIdAndDelete(req.params.id);
    if (!resultado) return res.sendStatus(404);
    res.sendStatus(204);
});

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

app.listen(8080, () => {
    console.log('Servidor arrancado');
});
