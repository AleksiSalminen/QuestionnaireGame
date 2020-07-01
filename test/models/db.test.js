/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
'use strict';

// NPM install mongoose and chai. Make sure mocha is globally
// installed
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const chai = require('chai');
const expect = chai.expect;
// const assert = require('assert');
const fs = require('fs');
const path = require('path');
const config = require('config');

describe('Config', function() {

    describe('mongo config', function() {
        it('must have mongo key', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig).to.exist;

        });
        it('must have a JSON object as a value', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig).to.be.an('object');
        });
        it('must define keys host, port, and db in the JSON object', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig.host).to.exist;
            expect(mongoConfig.port).to.exist;
            expect(mongoConfig.db).to.exist;
        });
    });

    describe('db connection', function() {

        // let db;
        // let mongoConfig;

        it('must be able to store data', async function() {

            const dbConfig = config.get('mongo');
            // connect to database
            const db = require('../../models/db');
            db.connectDB(dbConfig);

            // const number=2;
            const rawData = fs.readFileSync(path.resolve(__dirname, '../../setup/game.questionnaire.json'));
            const data = JSON.parse(rawData);
            const Questionnaire = require('../../models/questionnaire');

            // delete old entries and from the database
            await Questionnaire.deleteMany({}); //TODO - reconsider
            // then add sample data to database
            //TODO: ask the count before and after, the delta should be NUMBER_OF_QUESTIONS
            await Questionnaire.create(data);

            db.disconnectDB();

        });


    });
});

// /* TODO: use this instead of the .json file, needs some more debugging, options not unique? */
// function generateData(NUMBER_OF_OPTIONS) {
//     // eslint-disable-next-line sonarjs/prefer-object-literal
//     const data = {};
//     data.title = 'Count from the fall';
//     data.submissions = '100';
//     data.questions = [];

//     const endResult = getRandomInt(60);    //TODO: more "AI" version, if the endResult is generated based on the person's previous results
//     data.questions.push(getQuestion(endResult, NUMBER_OF_OPTIONS));

//     return [data];
// }

// function getQuestion(endResult, NUMBER_OF_OPTIONS) {
//     return  {
//         title: `Choose calculations whose end result is ${endResult}`,
//         maxPoints: 10,
//         options: getOptions(endResult, NUMBER_OF_OPTIONS)
//     };
// }

// function getRandomInt(max) {
//     return Math.floor(Math.random() * Math.floor(max));
// }

// const ADDITION = 0;
// const SUBSTRACTION = 1;
// const MULTIPLICATION = 2;
// const DIVISION = 3;

// function getOptions(rndEndResult, number) {
//     const options = [];
//     const titles = [];
//     for (let i = 0; options.length < number; i++) {
//         const rndCalcType = getRandomInt(4);
//         // questions.push(JSON.stringify(getOption(rndEndResult, rndCalcType)));
//         const option = getOption(rndEndResult, rndCalcType);
//         if (titles.includes(option[0]) || option[0]==null) continue;
//         options.push({option:option[0], correctness:option[1]});
//     }
//     return options;
// }

// // eslint-disable-next-line sonarjs/cognitive-complexity
// function getOption(endResult, rndCalcType) {
//     //  "options": [{"option": "25 + 15","correctness": true}]
//     //
//     // addition
//     // substraction
//     // division
//     // multiplication
//     let first = getRandomInt(endResult);
//     const sign = getRandomInt(2);
//     let rndError;
//     let second;
//     if (rndCalcType === ADDITION) {
//         second = endResult - first;
//         // add error
//         rndError = getRandomInt(4);
//         second = Math.abs(sign < 1 ? second : (sign < 2 ? second - rndError : second + rndError));
//         return [`${first} + ${second}`, (second + first === endResult)];
//     }
//     if (rndCalcType === SUBSTRACTION) {
//         second = endResult + first;
//         rndError = getRandomInt(5);
//         second = sign < 1 ? second : (sign < 2 ? second - rndError : second + rndError);
//         return [`${second} - ${first}`, second - first === endResult];
//     }
//     if (rndCalcType === MULTIPLICATION) {
//         first = getRandomInt(Math.floor(endResult / 2));
//         if (first === 0) first = 1;
//         second = Math.floor(endResult / first);
//         rndError = getRandomInt(2);
//         second = sign < 1 ? second - rndError : second + rndError;
//         return `${first} * ${second}`, (first * second === endResult);
//     }
//     if (rndCalcType === DIVISION) {
//         second = getRandomInt(7);
//         if (second === 0) second = 1;
//         first = endResult * second;
//         rndError = getRandomInt(2);
//         first = sign < 1 ? first - rndError : first + rndError;
//         return [`${first} / ${second}`, (first / second === endResult)]
//     }
//     return [null, null];
// }
