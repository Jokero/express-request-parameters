'use strict';

const parameters = require('../index');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest-as-promised');
const expect = require('chai').expect;


const bookSchema = {
    name: {
        $validate: {
            required: true,
            string: true
        }
    }
};

const createApp = function() {
    const app = express();
    app.use(bodyParser.json());

    return app;
};


describe('express-request-parameters', function() {
    afterEach(function() {
        delete parameters.options;
    });

    context('throws exception when schema has incorrect type', function() {
        [false, null, undefined, [{ a: 1 }]].forEach(schema => {
            it(`schema = ${JSON.stringify(schema)}`, function() {
                const fn = () => parameters(schema);
                expect(fn).to.throw('schema must be either plain object or function returning a schema object');
            });
        });
    });

    it('puts processed data into req.parameters', function() {
        const app = createApp();
        app.post('/books', parameters(bookSchema), (req, res) => {
            res.send(req.parameters);
        });

        return request(app)
            .post('/books')
            .send({ name: 'The Adventures of Tom Sawyer' })
            .expect(200)
            .then(res => {
                expect(res.body.name).to.equal('The Adventures of Tom Sawyer');
            });
    });


    it('returns 400 error on validation error', function() {
        const app = createApp();
        app.post('/books', parameters(bookSchema), (req, res) => {
            res.send(req.parameters);
        });
        app.use((err, req, res, next) => {
            res.status(err.status).send(err);
        });

        return request(app)
            .post('/books')
            .send({ name: '' })
            .expect(400)
            .then(res => {
                expect(res.body).to.have.property('errors');
                expect(res.body.errors).to.have.property('name');
            });
    });

    it('uses default options', function() {
        parameters.options = { name: '$params' };

        const app = createApp();
        app.post('/books', parameters(bookSchema), (req, res) => {
            res.send(req.$params);
        });

        return request(app)
            .post('/books')
            .send({ name: 'The Adventures of Tom Sawyer' })
            .expect(200)
            .then(res => {
                expect(res.body.name).to.equal('The Adventures of Tom Sawyer');
            });
    });
});