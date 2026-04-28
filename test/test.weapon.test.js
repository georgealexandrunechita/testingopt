const mongoose = require('mongoose');
const { expect } = require('chai');
const Weapon = require('../models/Weapon');
const { connectDB } = require('../db');

before(async () => {
    await connectDB();
    await Weapon.deleteMany({});
});

after(async () => {
    await mongoose.connection.close();
});

describe('Weapon model', () => {
    it('crea un weapon válido', async () => {
        const w = await Weapon.create({
            name: 'Excalibur',
            damage: 50
        });
        expect(w._id).to.exist;
        expect(w.damage).to.equal(50);
    });

    it('no permite damage menor que 1', async () => {
        try {
            await Weapon.create({
                name: 'Broken Sword',
                damage: 0
            });
            expect.fail('Debería haber lanzado ValidationError');
        } catch (err) {
            expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
        }
    });

    it('no permite name demasiado corto', async () => {
        try {
            await Weapon.create({
                name: 'X',
                damage: 10
            });
            expect.fail('Debería haber lanzado ValidationError');
        } catch (err) {
            expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
        }
    });

    it('no permite name duplicado', async () => {
        await Weapon.create({
            name: 'Ultima Weapon',
            damage: 90
        });
        try {
            await Weapon.create({
                name: 'Ultima Weapon',
                damage: 80
            });
            expect.fail('Debería haber lanzado error de duplicado');
        } catch (err) {
            expect(err).to.exist;
        }
    });

    it('actualiza weapon correctamente', async () => {
        const w = await Weapon.create({
            name: 'Iron Sword',
            damage: 20
        });
        w.damage = 25;
        const updated = await w.save();
        expect(updated.damage).to.equal(25);
    });
});
