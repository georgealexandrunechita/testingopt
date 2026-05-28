const mongoose = require('mongoose');
const logger = require('./logger');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/otradb');
        logger.info('database connected', { uri: (process.env.MONGODB_URI || 'mongodb://localhost:27017/otradb').replace(/:\/\/.*@/, '://***@') });
    } catch (err) {
        logger.error('database connection failed', { error: err.message });
    }
}

module.exports = { connectDB };
