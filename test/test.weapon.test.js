const mongoose = require('mongoose');
const Weapon = require('../models/Weapon');
const { connectDB } = require('../db');

beforeAll(async () => {
    await connectDB();
    await Weapon.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Weapon model', () => {
    test('crea un weapon válido', async () => {
        const w = await Weapon.create({
            name: 'Excalibur',
            damage: 50
        });
        expect(w._id).toBeDefined();
        expect(w.damage).toBe(50);
    });

    test('no permite damage menor que 1', async () => {
        await expect(
            Weapon.create({
                name: 'Broken Sword',
                damage: 0
            })
        ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('no permite name demasiado corto', async () => {
        await expect(
            Weapon.create({
                name: 'X',
                damage: 10
            })
        ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('no permite name duplicado', async () => {
        await Weapon.create({
            name: 'Ultima Weapon',
            damage: 90
        });

        await expect(
            Weapon.create({
                name: 'Ultima Weapon',
                damage: 80
            })
        ).rejects.toThrow();
    });

    test('actualiza weapon correctamente', async () => {
        const w = await Weapon.create({
            name: 'Iron Sword',
            damage: 20
        });
        w.damage = 25;
        const updated = await w.save();
        expect(updated.damage).toBe(25);
    });
});
