require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');

describe('App', () => {
    it(`GET / responds with 200 containing "Hello, world! app is running on ${process.env.PORT}"`, () => {
        return supertest(app)
            .get('/')
            .expect(200, `Hello world! app is running on 8000`)
    })
});