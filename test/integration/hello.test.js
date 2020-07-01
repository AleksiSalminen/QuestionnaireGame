/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const config = require('config');
const http = require('http');
const Browser = require('zombie');

const app = require('../../app.js');
const admin = config.get('admin');
const port = 3333;

// Zombie.js documentation can be found at: https://www.npmjs.com/package/zombie

async function auth(browser) {
    // Load login page
    await browser.visit('/users/login');

    // Fill in login information and login
    browser.fill('email', admin.email);
    browser.fill('password', admin.password);
    await browser.pressButton('#btnLogin');
}

describe('Game: A+ protocol', function() {
    let server;
    let browser;

    beforeEach(async function() {
        server = http.createServer(app).listen(port);
        Browser.localhost('bwa', port);
        browser = new Browser();
        // console.log('A+ protocol defined in https://github.com/Aalto-LeTech/a-plus/blob/master/doc/GRADERS.md');

        await auth(browser);
        await browser.visit('/');
    });

    afterEach(async function() {
        server.close();
    });

    it('must have a form with POST method', function() {
        //http://zombie.js.org/#assertions
        browser.assert.element('form[method="POST"]');
        // browser.assert.attribute('form', 'method', 'post');
    });

    it('must have a form with submit button', function() {
        browser.assert.element('form button[type="submit"]');
    });

    it('the submit button must have id "grade"', function() {
        browser.assert.element('#grade');
        browser.assert.element('button#grade');
    });
});
