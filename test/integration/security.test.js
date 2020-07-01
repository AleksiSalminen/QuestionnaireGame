'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const expect = chai.expect;
chai.use(chaiHttp);

const app = require('../../app');
const admin = config.get('admin');
const loginUrl = '/users/login';

describe('Application security', function() {
    let request;
    let response;

    beforeEach(async function() {
        const { email, password } = admin;
        request = chai.request.agent(app);
        response = await request
            .post(loginUrl)
            .type('form')
            .send({ email, password });
    });

    afterEach(async function() {
        await response.get('/users/logout');
        request.close();
    });

    it('should have "HttpOnly" cookie policy', function() {
        const cookie = response.headers['set-cookie'].find(cookieString => {
            return cookieString.startsWith('bwa=');
        }).toLowerCase();

        // eslint-disable-next-line no-unused-expressions
        expect(cookie).to.exist;
        expect(cookie).to.include('httponly');
    });

    it('should have "SameSite" cookie policy set to Strict or Lax', function() {
        const cookie = response.headers['set-cookie'].find(cookieString => {
            return cookieString.startsWith('bwa=');
        }).toLowerCase();

        expect(cookie).to.satisfy((c) => {
            return c.includes('samesite=lax') || c.includes('samesite=strict');
        });
    });

    it('should block directory traversal', async function() {
        response = await request.get('/../app.js');
        expect(response).to.have.status(404);
    });
});
