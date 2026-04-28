const mongoose = require('mongoose');
const { expect } = require('chai');
const Character = require('../models/Character');
const { connectDB } = require('../db');

before(async () => {
    await connectDB();
    await Character.deleteMany({});
});

after(async () => {
    await mongoose.connection.close();
});

describe('Character model', () => {
    it('crea un character válido', async () => {
        const c = await Character.create({
            name: 'Cloud',
            job: 'Fighter',
            weapon: 'Buster Sword',
            level: 10
        });
        expect(c._id).to.exist;
        expect(c.name).to.equal('Cloud');
    });

    it('falla si falta name', async () => {
        try {
            await Character.create({
                job: 'Mage',
                weapon: 'Staff',
                level: 3
            });
            expect.fail('Debería haber lanzado ValidationError');
        } catch (err) {
            expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
        }
    });

    it('falla si job no está en el enum', async () => {
        try {
            await Character.create({
                name: 'BadJob',
                job: 'Soldier',
                weapon: 'Sword',
                level: 5
            });
            expect.fail('Debería haber lanzado ValidationError');
        } catch (err) {
            expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
        }
    });

    it('falla si level es menor que 1', async () => {
        try {
            await Character.create({
                name: 'LowLevel',
                job: 'Monk',
                weapon: 'Stick',
                level: 0
            });
            expect.fail('Debería haber lanzado ValidationError');
        } catch (err) {
            expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
        }
    });

    it('actualiza un character con datos válidos', async () => {
        const c = await Character.create({
            name: 'Barret',
            job: 'Healer',
            weapon: 'Gun-Arm',
            level: 7
        });
        c.level = 9;
        const updated = await c.save();
        expect(updated.level).to.equal(9);
    });
});
