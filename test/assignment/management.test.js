/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const config = require('config');
const http = require('http');

const app = require('../../app.js');
const admin = config.get('admin');

describe('Game: A+ protocol', function() {
    it('C: create operation available', function() {
        /*
        * Create operation testing done in
        * createQuestionnaire.test.js
        */
    });

    it('R: read operation available', function() {
        /*
        * Read operation testing done in
        * readQuestionnaire.test.js
        */
    });

    it('U: update operation available', function() {
        /*
        * Update operation testing done in
        * updateQuestionnaire.test.js
        */
    });

    it('D: delete operation available', function() {
        /*
        * Delete operation testing done in
        * deleteQuestionnaire.test.js
        */
    });
});
