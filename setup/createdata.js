'use strict';

/**
 * Example code to save sample game data to database
 */

const fs = require('fs');
const path = require('path');

const Questionnaire = require('../models/questionnaire');

module.exports = async function() {
    const rawData = fs.readFileSync(
        path.resolve(__dirname, './game.questionnaire.json')
    );
    const data = JSON.parse(rawData);

    // delete old entries from the database
    // then add sample data to database
    await Questionnaire.deleteMany({});
    await Questionnaire.create(data);

    return 'Inserted sample data to database';
};
