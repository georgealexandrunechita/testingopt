const mongoose = require('mongoose');
const Character = require('../models/Character');
const { connectDB } = require('../db');

beforeAll(async () => {
    await connectDB();
    await Character.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Character model', () => {
    test('crea un character válido', async () => {
        const c = await Character.create({
            name: 'Cloud',
            job: 'Fighter',
            weapon: 'Buster Sword',
            level: 10
        });
        expect(c._id).toBeDefined();
        expect(c.name).toBe('Cloud');
    });

    test('falla si falta name', async () => {
        await expect(
            Character.create({
                job: 'Mage',
                weapon: 'Staff',
                level: 3
            })
        ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('falla si job no está en el enum', async () => {
        await expect(
            Character.create({
                name: 'BadJob',
                job: 'Soldier',
                weapon: 'Sword',
                level: 5
            })
        ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('falla si level es menor que 1', async () => {
        await expect(
            Character.create({
                name: 'LowLevel',
                job: 'Monk',
                weapon: 'Stick',
                level: 0
            })
        ).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('actualiza un character con datos válidos', async () => {
        const c = await Character.create({
            name: 'Barret',
            job: 'Healer',
            weapon: 'Gun-Arm',
            level: 7
        });

        c.level = 9;
        const updated = await c.save();
        expect(updated.level).toBe(9);
    });
});