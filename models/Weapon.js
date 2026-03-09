const mongoose = require('mongoose');

const weaponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 40,
        unique: true
    },
    damage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    }
});

const Weapon = mongoose.model('Weapon', weaponSchema);

module.exports = Weapon;
