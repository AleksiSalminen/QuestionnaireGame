/* eslint-disable no-unused-expressions */
'use strict';

const chai = require('chai');
const expect = chai.expect;

const Questionnaire = require('../../models/questionnaire');

/**
 * Following constants are meant to be test default values
 * DO NOT EDIT THESE DIRECTLY INSIDE TEST CODE!!
 * AVOID REFERENCES AND CREATE ALWAYS COPIES!!
 */

const dollarMsg='text value with a dollar($) sign';
const validId = '1234567890aBfedcbA098765';
const invalidIds = [
    '', // empty string, too short
    '1234567890aXfedcba098765', // invalid character X
    '1234567890afedcba098765', // too short
    '1234567890abfedcba098765E', // too long
    123456789012345678901234, // not a string
    true,
    false,
    NaN,
    Infinity
];

const validIntegers = ['1', '1.0', '2e3', '+2', 1, 1.0, 2e3];
const invalidIntegers = [
    '', // empty string
    'a',
    '3x', // non-numeric string,
    '0.3',
    NaN,
    Infinity,
    null,
    0.3
];

const validOption = {
    option: 'option',
    hint: 'hint',
    correctness: true
};

const validOptions = [
    {
        option: 'option 1',
        hint: 'hint',
        correctness: true
    },
    {
        option: 'option 2',
        hint: 'hint',
        correctness: false
    }
];

const validQuestion = {
    title: 'question',
    maxPoints: 1,
    // avoid object references and create copies
    options: validOptions.map((opt) => {
        return { ...opt }; // again avoid object references and create copies
    })
};

const opt0 = 'questions.0.options';


const validQuestions = [
    {
        title: 'question 1',
        maxPoints: 1,
        // avoid object references and create copies
        options: validOptions.map((opt) => {
            return { ...opt }; // again avoid object references and create copies
        })
    },
    {
        title: 'question 2',
        maxPoints: 1,
        // avoid object references and create copies
        options: validOptions.map((opt) => {
            return { ...opt }; // again avoid object references and create copies
        })
    }
];

const validQuestionnaire = {
    title: 'title',
    // avoid object references and create copies
    submissions: 1,
    questions: [{ ...validQuestion }]
};

describe('Questionnaire', function() {
    describe('Input validation', function() {
        describe('validateOption()', function() {
            let option = {};

            beforeEach(function() {
                // avoid object references and create copies
                option = { ...validOption };
            });

            it('must validate "id" without errors', function() {
                option.id = validId;

                const { error } = Questionnaire.validateOption(option);
                expect(error).not.to.exist;
            });

            it('must not accept invalid mongo objectId for "id"', function() {
                invalidIds.forEach((id) => {
                    option.id = id;
                    const { error } = Questionnaire.validateOption(option);
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('must allow "_id"', function() {
                option._id = validId;

                const { error } = Questionnaire.validateOption(option);
                expect(error).not.to.exist;
            });

            it('must not accept invalid or empty mongo objectId for "_id"', function() {
                invalidIds.forEach((id) => {
                    option._id = id;
                    const { error } = Questionnaire.validateOption(option);
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('must not allow both "id" and "_id" at the same time', function() {
                option.id = validId;
                option._id = validId;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('allows both "id" and "_id" be missing at the same time', function() {
                const { error } = Questionnaire.validateOption(option);
                expect(error).not.to.exist;
            });

            it('should require "option"', function() {
                delete option.option;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should trim spaces from "option"', function() {
                option.option = '  option     ';

                const { error, value } = Questionnaire.validateOption(
                    option
                );
                expect(error).not.to.exist;
                expect(value).to.exist;
                expect(value)
                    .to.be.an('object')
                    .that.has.a.property('option');
                expect(value.option).to.equal('option');
            });

            it('should not allow "option" to have only spaces', function() {
                option.option = '       ';

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "option" to be at least one character long', function() {
                option.option = '';

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;

                option.option = 'A';
                const { error: notError } = Questionnaire.validateOption(
                    option
                );
                expect(notError).to.not.exist;
            });

            it('should not allow "option" to be longer than 50 characters', function() {
                option.option =
                    'Very long text value that is over fifty characters long!';

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should not allow a dollar sign ($) inside "option"', function() {
                option.option = dollarMsg;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should allow missing "hint"', function() {
                delete option.hint;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.not.exist;
            });

            it('should allow empty "hint"', function() {
                option.hint = '';

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.not.exist;
            });

            it('should trim spaces from "hint"', function() {
                option.hint = '  hint     ';

                const { error, value } = Questionnaire.validateOption(
                    option
                );
                expect(error).not.to.exist;
                expect(value).to.exist;
                expect(value)
                    .to.be.an('object')
                    .that.has.a.property('hint');
                expect(value.hint).to.equal('hint');
            });

            it('should not allow a dollar sign ($) inside "hint"', function() {
                option.hint = dollarMsg;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('limits "hint" to 100 characters', function() {
                option.hint = `${'happy'.repeat(20)  }y`;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should not allow missing "correctness"', function() {
                delete option.correctness;

                const { error } = Questionnaire.validateOption(option);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should not allow empty "correctness"', function() {
                const empties = [null, undefined, ''];

                empties.forEach((val) => {
                    option.correctness = val;
                    const { error } = Questionnaire.validateOption(option);
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('should allow booleans for "correctness"', function() {
                const values = [true, false];

                values.forEach((val) => {
                    option.correctness = val;
                    const { error } = Questionnaire.validateOption(option);
                    expect(error).to.not.exist;
                });
            });

            it('should allow predefined truthy and falsy values for "correctness" and convert them to booleans', function() {
                const trueValues = ['t', 'y', 'yes', '1', 1];
                const falseValues = ['f', 'n', 'no', '0', 0];

                trueValues.forEach((val) => {
                    option.correctness = val;
                    const {
                        error: trueError,
                        value: trueValue
                    } = Questionnaire.validateOption(option);
                    expect(trueError).to.not.exist;
                    expect(trueValue).to.exist;
                    expect(trueValue)
                        .to.be.an('object')
                        .that.has.a.property('correctness');
                    expect(trueValue.correctness).to.be.true;
                });

                falseValues.forEach((val) => {
                    option.correctness = val;
                    const {
                        error: falseError,
                        value: falseValue
                    } = Questionnaire.validateOption(option);
                    expect(falseError).to.not.exist;
                    expect(falseValue).to.exist;
                    expect(falseValue)
                        .to.be.an('object')
                        .that.has.a.property('correctness');
                    expect(falseValue.correctness).to.be.false;
                });
            });
        });

        describe('validateQuestion()', function() {
            let options = [];
            let question = {};

            beforeEach(function() {
                // avoid object references and create copies

                options = validOptions.map((opt) => {
                    return { ...opt };
                });

                question = { ...validQuestion };
            });

            it('should allow "id"', function() {
                question.id = validId;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).not.to.exist;
            });

            it('should not accept invalid mongo objectId for "id"', function() {
                invalidIds.forEach((id) => {
                    question.id = id;
                    const { error } = Questionnaire.validateQuestion(
                        question
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('should allow "_id"', function() {
                question._id = validId;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).not.to.exist;
            });

            it('should not accept invalid mongo objectId for "_id"', function() {
                invalidIds.forEach((id) => {
                    question._id = id;
                    const { error } = Questionnaire.validateQuestion(
                        question
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('should not allow both "id" and "_id" at the same time', function() {
                question.id = validId;
                question._id = validId;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should allow both "id" and "_id" be missing at the same time', function() {
                const { error } = Questionnaire.validateQuestion(question);
                expect(error).not.to.exist;
            });

            it('must require "title"', function() {
                delete question.title;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('trims spaces from question "title"', function() {
                question.title = '  question     ';

                const { error, value } = Questionnaire.validateQuestion(
                    question
                );
                expect(error).not.to.exist;
                expect(value).to.exist;
                expect(value)
                    .to.be.an('object')
                    .that.has.a.property('title');
                expect(value.title).to.equal('question');
            });

            it('must not allow "title" with spaces only', function() {

                question.title = ' '.repeat(7);
                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('requires "title" to be at least one character long', function() {
                question.title = '';

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;

                question.title = 'A';
                const { error: notError } = Questionnaire.validateQuestion(
                    question
                );
                expect(notError).to.not.exist;
            });

            it('must not allow "title" to be longer than 100 characters', function() {
                question.title = `${'happy'.repeat(20)}y`;
                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it(`should not allow ${dollarMsg} in title`, function() {
                question.title = dollarMsg;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "maxPoints"', function() {
                delete question.maxPoints;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should only allow integers for "maxPoints"', function() {
                invalidIntegers.forEach((invalidInt) => {
                    question.maxPoints = invalidInt;
                    const { error } = Questionnaire.validateQuestion(
                        question
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });

                validIntegers.forEach((validInt) => {
                    question.maxPoints = validInt;
                    const {
                        error,
                        value
                    } = Questionnaire.validateQuestion(question);
                    expect(error).to.not.exist;
                    expect(value).to.exist;
                    expect(value)
                        .to.be.an('object')
                        .that.has.a.property('maxPoints');
                    expect(value.maxPoints).to.equal(Number(validInt));
                });
            });

            it('should allow only positive integers for "maxPoints"', function() {
                const maxPoints = [-1, 0];

                maxPoints.forEach((maximum) => {
                    question.maxPoints = maximum;

                    const { error } = Questionnaire.validateQuestion(
                        question
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });

                question.maxPoints = 1;
                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.not.exist;
            });

            it('should require "options"', function() {
                delete question.options;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require atleast two "options"', function() {
                question.options = [];

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;

                options.forEach((opt) => {
                    question.options = [opt];

                    const {
                        error: optError
                    } = Questionnaire.validateQuestion(question);
                    expect(optError).to.exist;
                    expect(optError).to.not.be.empty;
                });

                question.options = options;
                const { error: notError } = Questionnaire.validateQuestion(
                    question
                );
                expect(notError).to.not.exist;
            });

            it('should require atleast one correct answer in "options"', function() {
                const incorrectAnswers = options.map((opt) => {
                    opt.correctness = false;
                    return opt;
                });

                question.options = incorrectAnswers;

                const { error } = Questionnaire.validateQuestion(question);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });
        });

        describe('validateQuestionnaire()', function() {
            let questions = {};
            let questionnaire = {};

            beforeEach(function() {
                // avoid object references and create copies

                questions = [...validQuestions];
                questionnaire = { ...validQuestionnaire };
            });

            it('should allow "id"', function() {
                questionnaire.id = validId;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).not.to.exist;
            });

            it('should not accept invalid mongo objectId for "id"', function() {
                invalidIds.forEach((id) => {
                    questionnaire.id = id;
                    const { error } = Questionnaire.validateQuestionnaire(
                        questionnaire
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('should allow "_id"', function() {
                questionnaire._id = validId;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).not.to.exist;
            });

            it('should not accept invalid mongo objectId for "_id"', function() {
                invalidIds.forEach((id) => {
                    questionnaire._id = id;
                    const { error } = Questionnaire.validateQuestionnaire(
                        questionnaire
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });
            });

            it('should not allow both "id" and "_id" at the same time', function() {
                questionnaire.id = validId;
                questionnaire._id = validId;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should allow both "id" and "_id" be missing at the same time', function() {
                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).not.to.exist;
            });

            it('must require "title"', function() {
                delete questionnaire.title;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('trims spaces from "title"', function() {
                questionnaire.title = '  title     ';

                const {
                    error,
                    value
                } = Questionnaire.validateQuestionnaire(questionnaire);
                expect(error).not.to.exist;
                expect(value).to.exist;
                expect(value)
                    .to.be.an('object')
                    .that.has.a.property('title');
                expect(value.title).to.equal('title');
            });

            it('must not allow "title" to have only spaces', function() {
                questionnaire.title = '       ';

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "title" to be longer than zero', function() {
                questionnaire.title = '';

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;

                questionnaire.title = 'A';
                const {
                    error: notError
                } = Questionnaire.validateQuestionnaire(questionnaire);
                expect(notError).to.not.exist;
            });

            it('should not allow "title" to > 100 characters', function() {
                questionnaire.title = `${'happy'.repeat(20)}y`;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should not allow a dollar sign ($) inside "title"', function() {
                questionnaire.title = dollarMsg;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "submissions"', function() {
                delete questionnaire.submissions;

                const { error } = Questionnaire.validateQuestionnaire(questionnaire);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should only allow integers for "submissions"', function() {
                invalidIntegers.forEach((invalidInt) => {
                    questionnaire.submissions = invalidInt;
                    const { error } = Questionnaire.validateQuestionnaire(
                        questionnaire
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });

                validIntegers.forEach((validInt) => {
                    questionnaire.submissions = validInt;
                    const {
                        error,
                        value
                    } = Questionnaire.validateQuestionnaire(questionnaire);
                    expect(error).to.not.exist;
                    expect(value).to.exist;
                    expect(value)
                        .to.be.an('object')
                        .that.has.a.property('submissions');
                    expect(value.submissions).to.equal(Number(validInt));
                });
            });

            it('should allow only positive integers for "submissions"  that can be ensured by defining min: 1 in the schema', function() {
                const submissions = [-1, 0];

                submissions.forEach((submission) => {
                    questionnaire.submissions = submission;

                    const { error } = Questionnaire.validateQuestionnaire(
                        questionnaire
                    );
                    expect(error).to.exist;
                    expect(error).to.not.be.empty;
                });

                questionnaire.submissions = 1;
                const { error } = Questionnaire.validateQuestionnaire(questionnaire);
                expect(error).to.not.exist;
            });

            it('should require "questions"', function() {
                delete questionnaire.questions;

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "questions" to not be empty', function() {
                questionnaire.questions = [];

                const { error } = Questionnaire.validateQuestionnaire(
                    questionnaire
                );
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should allow multiple "questions"', function() {
                questionnaire.questions = questions;

                const {
                    error: notError
                } = Questionnaire.validateQuestionnaire(questionnaire);
                expect(notError).to.not.exist;
            });
        });

        describe('validateSearch()', function() {
            let search = {};

            beforeEach(function() {
                // avoid object references and create copies

                const validSearch = {
                    title: 'title'
                };

                search = { ...validSearch };
            });

            it('should not allow missing "title"', function() {
                delete search.title;

                const { error } = Questionnaire.validateSearch(search);
                expect(error).to.not.exist;
            });

            it('trims spaces from "title"', function() {
                search.title = '  title     ';

                const { error, value } = Questionnaire.validateSearch(
                    search
                );
                expect(error).not.to.exist;
                expect(value).to.exist;
                expect(value)
                    .to.be.an('object')
                    .that.has.a.property('title');
                expect(value.title).to.equal('title');
            });

            it('must not allow "title" to have only spaces', function() {
                search.title = '       ';

                const { error } = Questionnaire.validateSearch(search);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should require "title" to be atleast one character long', function() {
                search.title = '';

                const { error } = Questionnaire.validateSearch(search);
                expect(error).to.exist;
                expect(error).to.not.be.empty;

                search.title = 'A';
                const { error: notError } = Questionnaire.validateSearch(
                    search
                );
                expect(notError).to.not.exist;
            });

            it('should not allow "title" > 100 characters', function() {
                search.title = `${'happy'.repeat(20)}y`;

                const { error } = Questionnaire.validateSearch(search);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });

            it('should not allow a dollar sign ($) inside "title"', function() {
                search.title = dollarMsg;

                const { error } = Questionnaire.validateSearch(search);
                expect(error).to.exist;
                expect(error).to.not.be.empty;
            });
        });
    });

    describe('Schema validation', function() {
        describe('Questionnaire Schema', function() {
            let questions = {};
            let questionnaire = {};

            beforeEach(function() {
                // avoid object references and create copies

                questions = [...validQuestions];
                questionnaire = { ...validQuestionnaire };
                questionnaire.questions = [{ ...validQuestion }];
            });

            it('should require "title"', function(done) {
                delete questionnaire.title;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.title).to.exist;
                    done();
                });
            });

            it('should trim spaces from "title"', function(done) {
                questionnaire.title = '  title   ';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    // expect(error).to.not.exist;
                    expect(q.title).to.equal('title');
                    done();
                });
            });

            it('should not allow "title" to have only spaces', function(done) {
                questionnaire.title = '     ';

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.title).to.exist;
                    done();
                });
            });

            it('should require "title" to be at least one character long', function(done) {
                questionnaire.title = '';

                let q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.title).to.exist;
                });

                questionnaire.title = 'a';

                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.title).to.equal('a');
                    done();
                });
            });

            it('should not allow "title" to be longer than 100 characters', function(done) {
                questionnaire.title = `${'hello'.repeat(20)}o`;

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.title).to.exist;
                    done();
                });
            });

            it('should require "submissions"', function(done) {
                delete questionnaire.submissions;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.submissions).to.exist;
                    done();
                });
            });

            it('should allow only integers for "submissions"', function(done) {
                invalidIntegers.forEach((invalidInt) => {
                    questionnaire.submissions = invalidInt;

                    const q = new Questionnaire(questionnaire);
                    q.validate((error) => {
                        expect(error.errors).to.exist;
                        expect(error.errors.submissions).to.exist;
                    });
                });

                done();
            });

            it('should allow only positive integers for "submissions"', function(done) {
                questionnaire.submissions = -1;

                let q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.submissions).to.exist;
                });

                questionnaire.submissions = 0;
                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.submissions).to.exist;
                });

                questionnaire.submissions = 1;
                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(questionnaire.submissions).to.equal(1);
                    done();
                });
            });

            it('should require "questions"', function(done) {
                delete questionnaire.questions;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                    done();
                });
            });

            it('should require "questions" to not be empty', function(done) {
                questionnaire.questions = [];

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                    done();
                });
            });

            it('should allow multiple "questions"', function(done) {
                questionnaire.questions = questions;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    done();
                });
            });

            it('should require all "questions" have unique question text', function(done) {
                questionnaire.questions = [];

                questions.forEach((qstn) => {
                    qstn.title = 'question';
                    questionnaire.questions.push({...qstn});
                });

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                    done();
                });
            });
        });

        describe('Question Schema', function() {
            let options = [];
            let questionnaire = {};
            const maxP = 'questions.0.maxPoints';

            beforeEach(function() {
                // avoid object references and create copies

                options = validOptions.map((opt) => {
                    return { ...opt };
                });

                questionnaire = { ...validQuestionnaire };
                questionnaire.questions = [{ ...validQuestion }];
            });

            it('should require "title"', function(done) {
                delete questionnaire.questions[0].title;

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                    done();
                });
            });

            it('should trim spaces from "title"', function(done) {
                questionnaire.questions[0].title = '  question   ';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].title).to.equal('question');
                    done();
                });
            });

            it('should not allow "title" to have only spaces', function(done) {
                questionnaire.questions[0].title = '     ';

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                    done();
                });
            });

            it('should require "title" to be at least one character long', function(done) {
                questionnaire.questions[0].title = '';

                let q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors.questions).to.exist;
                });

                questionnaire.questions[0].title = 'a';

                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].title).to.equal('a');
                    done();
                });
            });

            it('should not allow "title" to be longer than 100 characters', function(done) {
                questionnaire.questions[0].title =
                    'This very, very, very, very, very, very long text value is exactly one hundred an one characters long';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors['questions.0.title']).to.exist;
                    done();
                });
            });

            it('should require "maxPoints"', function(done) {
                delete questionnaire.questions[0].maxPoints;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[maxP]).to.exist;
                    done();
                });
            });

            it('should allow only integers for "maxPoints"', function(done) {
                invalidIntegers.forEach((invalidInt) => {
                    questionnaire.questions[0].maxPoints = invalidInt;

                    const q = new Questionnaire(questionnaire);
                    q.validate((error) => {
                        expect(error.errors).to.exist;
                        expect(error.errors[maxP]).to.exist;
                    });
                });

                done();
            });

            it('should allow only positive integers for "maxPoints"', function(done) {
                questionnaire.questions[0].maxPoints = -1;

                let q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[maxP]).to.exist;
                });

                questionnaire.questions[0].maxPoints = 0;
                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[maxP]).to.exist;
                });

                questionnaire.questions[0].maxPoints = 1;
                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(questionnaire.questions[0].maxPoints).to.equal(1);
                    done();
                });
            });

            it('should require "options"', function(done) {
                delete questionnaire.questions[0].options;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });

            it('should require at least two "options"', function(done) {
                questionnaire.questions[0].options.pop();

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });

            it('should require all "options" to have unique option text', function(done) {
                questionnaire.questions[0].options = options.map((option) => {
                    option.option = 'option';
                    return option;
                });

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });

            it('should require at least one correct answer in "options"', function(done) {
                questionnaire.questions[0].options = options.map((option) => {
                    option.correctness = false;
                    return option;
                });

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });
        });

        describe('Option Schema', function() {
            let questionnaire = {};

            beforeEach(function() {
                // avoid object references and create copies
                const options = validOptions.map((opt) => {
                    return { ...opt };
                });

                const question = { ...validQuestion };
                question.options = options.map((opt) => {
                    return { ...opt };
                });

                questionnaire = { ...validQuestionnaire };
                questionnaire.questions = [{ ...question }];
            });

            it('should require "option"', function(done) {
                delete questionnaire.questions[0].options[0].option;

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });

            it('should trim spaces from "option"', function(done) {
                questionnaire.questions[0].options[0].option = '  option 1  ';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].option).to.equal('option 1');
                    done();
                });
            });

            it('should not allow "option" to have only spaces', function(done) {
                questionnaire.questions[0].options[0].option = '    ';

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });

            it('should require "option" to be at least one character long', function(done) {
                questionnaire.questions[0].options[0].option = '';

                let q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                });

                questionnaire.questions[0].options[0].option = 'a';

                q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].option).to.equal('a');
                    done();
                });
            });

            it('should not allow "option" to be longer than 50 characters', function(done) {
                questionnaire.questions[0].options[0].option =
                    'Very long text value that is over fifty characters long!';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors['questions.0.options.0.option']).to.exist;
                    done();
                });
            });

            it('should allow missing "hint"', function(done) {
                delete questionnaire.questions[0].options[0].hint;

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].hint).to.not.exist;
                    done();
                });
            });

            it('should allow empty "hint"', function(done) {
                questionnaire.questions[0].options[0].hint = '';

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].hint).to.not.exist;
                    done();
                });
            });

            it('should ignore "hint" that is set to undefined', function(done) {
                questionnaire.questions[0].options[0].hint = undefined;

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].hint).to.not.exist;
                    done();
                });
            });

            it('should trim spaces from "hint"', function(done) {
                questionnaire.questions[0].options[0].hint = '  hint   ';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error).to.not.exist;
                    expect(q.questions[0].options[0].hint).to.equal('hint');
                    done();
                });
            });

            it('should not allow "hint" to be longer than 100 characters', function(done) {
                questionnaire.questions[0].options[0].hint =
                    'This very, very, very, very, very, very long text value is exactly one hundred an one characters long';

                const q = new Questionnaire(questionnaire);
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors['questions.0.options.0.hint']).to.exist;
                    done();
                });
            });

            it('should require "correctness"', function(done) {
                delete questionnaire.questions[0].options[0].correctness;

                const q = new Questionnaire(questionnaire);
                // eslint-disable-next-line sonarjs/no-identical-functions
                q.validate((error) => {
                    expect(error.errors).to.exist;
                    expect(error.errors[opt0]).to.exist;
                    done();
                });
            });
        });
    });
});

