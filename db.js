const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect('mongodb://localhost:27017/otradb')
    .then(() => console.log('Conectado correctamente'))
    .catch((err) => console.log(err))
}

module.exports = {connectDB};