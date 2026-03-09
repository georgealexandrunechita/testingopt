const mongoose = require('mongoose');

const miSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is mandatory'],
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [20, 'Name must have no more than 20 characters']
    },
    weapon: {
        type: String,
        required: [true, 'Weapon is mandatory']
    },
    job: {
        type: String,
        enum: {
            values: ['Fighter', 'Mage', 'Healer', 'Monk'],
            message: 'Job must be these things'
        },
        required: [true, 'Job is required']
    },
    level: {
        type: Number,
        min: [1, 'Minimum level is 1'],
        max: [99, 'Maximum level is 99'],
        required: [true, 'Level is required']
    }
})

module.exports = mongoose.model('Character', miSchema);