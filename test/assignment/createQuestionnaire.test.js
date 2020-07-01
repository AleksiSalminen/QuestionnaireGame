/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */

'use strict';
const http = require('http');
const assert = require('assert');
const chai = require('chai');
const expect = require('chai').expect;
const should = require('chai').should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const request = require('supertest');
const cheerio = require('cheerio');
const fs = require('fs');

const User = require('../../models/user')
const Questionnaire = require('../../models/questionnaire')

const app = require('../../app.js');
const port = 3000;

const fPath = 'test/assignment/testCreateQs/';

describe('Create Questionnaire', function () {
/*
*
* TODO: make a test, that tries to access questionnaire creation,
* while not being logged in
* Implement this in the 'Questionnaire creation authorization' test area
*
*/


/**
 * Extract the csrf token from the given response object
 * @param {Object} res response object
 */

function extractCsrfToken(res) {
    var $ = cheerio.load(res.text);
    return $('[name = _csrf]').val();
}


/*
* --  User logins  --
*/

/*
* Log in as an admin
*/

const adminData = {
    name: 'admin',
    email: 'admin@email.fi',
    role: 'admin',
    password: '1234567890'
}

const teacherData = {
    name: 'teacher',
    email: 'teacher@email.fi',
    role: 'teacher',
    password: '1234567890'
}

const studentData = {
    name: 'student',
    email: 'student@email.fi',
    role: 'student',
    password: '1234567890'
}

before(function () {
  try {
      User.deleteMany({});

      const admin = new User(adminData);
      admin.save();

      const teacher = new User(teacherData);
      teacher.save();

      const student = new User(studentData);
      student.save();
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    throw err;
  }
});

const adminCredentials = {
    email: adminData.email,
    password: adminData.password
};

let adminUser = request.agent(app);

beforeEach(function (done) {
    adminUser
        .post('/users/login')
        .send(adminCredentials)
        .end(function (err, response) {
            if (err) return done(err);
            expect(response.statusCode).to.equal(302);
            expect('Location', '/users/me');
            done();
        });
});


/*
* Log in as a teacher
* NOTE: add a teacher to the database if doesn't exist
*/

const teacherCredentials = {
    email: teacherData.email,
    password: teacherData.password
};


let teacherUser = request.agent(app);

beforeEach(function (done) {
    teacherUser
        .post('/users/login')
        .send(teacherCredentials)
        .end(function (err, response) {
            if (err) return done(err);

            expect(response.statusCode).to.equal(302);
            expect('Location', '/users/me');
            done();
        });
});

/*
* Log in as a student
* NOTE: add a student to the database if doesn't exist
*/

const studentCredentials = {
    email: studentData.email,
    password: studentData.password
};

let studentUser = request.agent(app);

beforeEach(function (done) {
    studentUser
        .post('/users/login')
        .send(studentCredentials)
        .end(function (err, response) {
            if (err) return done(err);

            expect(response.statusCode).to.equal(302);
            expect('Location', '/users/me');
            done();
        });
});

let unauthorizedUser = request.agent(app);

const questionnaireData = {
  title: "valid title",
  submissions: 1,
  questions: [
    {
      title: "valid question title",
      maxPoints: "5",
      options: [
        {
          option: "valid option",
          correctness: true
        },
        {
          option: "another valid option",
          correctness: false
        }
      ]
    },
    {
      title: "another valid question title",
      maxPoints: "5",
      options: [
        {
          option: "valid option",
          correctness: true
        },
        {
          option: "another valid option",
          correctness: false
        }
      ]
    },
  ]
};

beforeEach(async function() {
    await Questionnaire.deleteMany({});

    let questionnaire = new Questionnaire(questionnaireData);

    await questionnaire.save();
});


/*
* --  Functions  --
*/

function sendToServer(rawData, getStatus, status, user, done) {
    user.get('/questionnaires/new')
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(getStatus);
            const csrfToken = '"' + extractCsrfToken(res) + '"';
            const data = rawData + csrfToken + ' }';

            user.post('/questionnaires/new')
                .send(JSON.parse(data))
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.statusCode).to.equal(status);
                    done();
                });
        });
}

function validationSend(file, done) {
    const rawData = fs.readFileSync(fPath + file, 'utf8');
    sendToServer(rawData, 200, 409, adminUser, done);
}

function validationSendMore(file, getStatus, status, done) {
    const rawData = fs.readFileSync(fPath + file, 'utf8');
    sendToServer(rawData, getStatus, status, adminUser, done);
}


/*
* --  Tests  --
*/

/**
 * Tests for authentication when sending the new questionnaire
 */

describe('Questionnaire creation authorization', function() {
  /*
    let server;
    beforeEach(function() {
        server = http.createServer(app).listen(port);
    });
    afterEach(function() {
        server.close();
    });

*/

    it('must let an admin to create new questionnaires', function (done) {
        const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
        sendToServer(rawData, 200, 200, adminUser, done);
    });

    it('must let a teacher to create new questionnaires', function (done) {
        const rawData = fs.readFileSync(fPath + '/teacherQuestionnaire.json', 'utf8');
        sendToServer(rawData, 200, 200, teacherUser, done);
    });

    it('must NOT let a student to create new questionnaires', function (done) {
        const rawData = fs.readFileSync(fPath + '/studentQuestionnaire.json', 'utf8');
        sendToServer(rawData, 302, 302, studentUser, done);
    });

    it('must NOT let a non-logged-in user to edit questionnaires', function (done) {
        const rawData = fs.readFileSync(fPath + '/studentQuestionnaire.json', 'utf8');
        sendToServer(rawData, 302, 302, unauthorizedUser, done);
    });

    it('must require a valid csrf token', function (done) {
        const rawData = fs.readFileSync(fPath + '/emptyTitle.json', 'utf8');
        const csrfToken = '" "';
        const data = rawData + csrfToken + ' }';

        adminUser.post('/questionnaires/new')
            .send(JSON.parse(data))
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.statusCode).to.equal(403);
                done();
            });
    });
});

/**
 * Tests for new questionnaire validation
 */

describe('New questionnaire validation', function () {
  /*
    let server;
    beforeEach(function() {
        server = http.createServer(app).listen(port);
    });

    afterEach(function() {
        server.close();
    });
*/

    it('must be able to handle an empty questionnaire', function (done) {
        const file = 'emptyQuestionnaire.json';
        validationSend(file, done);
    });

    it('must be able to handle an empty title', function (done) {
        const file = 'emptyTitle.json';
        validationSend(file, done);
    });

    it('must be able to handle a too long title', function (done) {
        const file = 'tooLongTitle.json';
        validationSend(file, done);
    });

    it('must be able to handle a duplicate title', function (done) {
        const file = 'duplicateTitle.json';
        validationSend(file, done);
    });

    it('must be able to handle incorrect submissions number', function (done) {
        const file = 'incorrectSubmissions.json';
        validationSend(file, done);
    });

    it('must be able to handle a no questions situation', function (done) {
        const file = 'noQuestions.json';
        validationSend(file, done);
    });

    it('must be able to handle a duplicate questions title', function (done) {
        const file = 'duplicateQuestions.json';
        validationSend(file, done);
    });

    it('must be able to handle a no options situation', function (done) {
        const file = 'noOptions.json';
        validationSend(file, done);
    });

    it('must be able to handle incorrect number of options', function (done) {
        const file = 'incorrectNumberOfOptions.json';
        validationSend(file, done);
    });

    it('must be able to handle duplicate options', function (done) {
        const file = 'duplicateOptions.json';
        validationSend(file, done);
    });

    it('must be able to handle "true" options missing', function (done) {
        const file = 'trueOptionsMissing.json';
        validationSend(file, done);
    });

    it('must be able to handle incorrect max points', function (done) {
        const file = 'incorrectMaxPoints.json';
        validationSend(file, done);
    });

    it('must be able to handle xss', function (done) {
        const file = 'xss.json';
        validationSendMore(file, 200, 200, done);
    });

});
});
