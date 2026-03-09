const express = require('express');
const app = express();
const Character = require('./models/Character');
const {connectDB} = require('./db');

connectDB();

app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/characters', async (req, res) => {
    const resultado = await Character.find();
    res.send(resultado);
})

app.get('/characters/:id', async (req, res) => {
    const resultado = await Character.findById(req.params.id);
    if (!resultado) return res.sendStatus(404);
    res.send(resultado);
})

app.post('/characters', async (req, res) => {
    const c = req.body;
    const existe = await Character.findOne({name: c.name});
    if (existe) {
        return res.sendStatus(400);
    }
    try {
        const resultado = await Character.create(c);
        res.status(201).send(resultado);
    } catch (err) {
        if (err.name == 'ValidationError') res.status(400).send(err.message);
    }
})

app.put('/characters/:id', async (req, res) => {
    const c = req.body;
    const existe = await Character.findOne({name: c.name, _id: {$ne: req.params.id}});
    if (existe) {
        return res.sendStatus(400);
    }
    try {
        const resultado = await Character.findByIdAndUpdate(req.params.id, {...req.body, $inc: {'__v': 1}}, {runValidators: true});
        if (!resultado) return res.sendStatus(404);
        res.sendStatus(204);
    } catch (err) {
        if (err.name == 'ValidationError') res.status(400).send(err.message);
    }
})

app.delete('/characters/:id', async (req, res) => {
    const resultado = await Character.findByIdAndDelete(req.params.id);
    if (!resultado) return res.sendStatus(404);
    res.sendStatus(204);
})

app.get('/index', (req, res) => {
    res.render('index', {title: 'Welcome'});
})

app.get('/list', (req, res) => {
    res.render('list', {characters: bbdd, title: 'Character list'});
})

app.get('/new', (req, res) => {
    res.render('new', {title: 'New character'})
})

app.post('/process', (req, res) => {
    const c = {
        id: parseInt(req.body.id),
        name: req.body.name,
        job: req.body.job,
        weapon: req.body.weapon,
        level: parseInt(req.body.level)
    };
    bbdd.push(c);
    res.redirect('/list');
})

app.listen(8080, () => {
    console.log('Servidor arrancado');
})