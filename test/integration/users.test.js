/* eslint-disable no-unused-expressions */
'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const expect = chai.expect;
chai.use(chaiHttp);

const app = require('../../app');
const User = require('../../models/user');

const admin = config.get('admin');
const loginUrl = '/users/login';
const registerUrl = '/users/register';

describe('/users', function() {
    let request;

    beforeEach(async function() {
        try {
            // remove all users from the database and re-create admin user
            await User.deleteMany({});

            const userData = {...admin, role: 'admin'};
            const user = new User(userData);
            await user.save();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            throw err;
        }
    });

    describe('/register', function() {
        let payload;

        beforeEach(function() {
            request = chai.request.agent(app);
            payload = {
                name: 'user',
                email: 'user@sposti.fi',
                password: '1234567890',
                passwordConfirmation: '1234567890'
            };
        });

        afterEach(function() {
            request.close();
        });

        it('should register successfully a correct user', async function() {
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).to.exist;
        });

        it('by default, the role of the registered user is student', async function() {
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).to.exist;
            expect(user.role).to.exist;
            expect(user.role).to.equal('student');
        });

        it('should prevent from registering the same user twice', async function() {
            await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);

            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).to.exist;
        });

        it('should fail registeration due to a missing email', async function() {
            const email = payload.email;
            delete payload.email;
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email }).exec();
            expect(user).not.to.exist;
        });

        it('should not accept registration with illegal email', async function() {
            payload.email = 'wrong-wrong';
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).not.to.exist;
        });

        it('should not accept registration with missing password', async function() {
            delete payload.password;
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).not.to.exist;
        });

        it('should not accept registration with too short password', async function() {
            payload.email = '1';
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).not.to.exist;
        });

        it('should not accept registration with missing password confirmation', async function() {
            delete payload.passwordConfirmation;
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).not.to.exist;
        });

        it('should not accept registration with different password and confirmation', async function() {
            payload.passwordConfirmation = `${payload.password}sdfjkhasjkhf`;
            const response = await request
                .post(registerUrl)
                .type('form')
                .send(payload);
            expect(response).to.not.redirect;
            expect(response).to.be.html;

            const user = await User.findOne({ email: payload.email }).exec();
            expect(user).not.to.exist;
        });
    });

    describe('/login', function() {
        let payload;

        beforeEach(function() {
            request = chai.request.agent(app);
            // create a new copy of admin for each test
            payload = { ...admin };
            delete payload.name;
            delete payload.role;
        });

        afterEach(function() {
            request.close();
        });

        it('should not accept login with missing email', async function() {
            delete payload.email;
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with invalid email', async function() {
            // remove '@' sing from email to intentionally make it invalid
            payload.email = payload.email.replace('@', '');
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with wrong email', async function() {
            // prepend one letter in front of the email to intentionally get it wrong
            // but keeping it still valid
            payload.email = `x${payload.email}`;
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with missing password', async function() {
            delete payload.password;
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with wrong password', async function() {
            // reverse password to intentionally get it wrong
            payload.password = [...payload.password].reverse().join('');
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should accept login with correct credentials', async function() {
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.have.cookie('bwa');
            expect(response).to.redirectTo(/\/$/);
        });

        it('should redirect to root "/" if already logged in', async function() {
            // log in
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.have.cookie('bwa');
            expect(response).to.redirectTo(/\/$/);

            // already logged in
            response = await request
                .get(loginUrl);
            expect(response).to.redirectTo(/\/$/);
        });
    });
});
