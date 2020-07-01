/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
'use strict';

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


const fPath = 'test/assignment/testUpdateQs/';

describe('Update Questionnaire', function () {

var id;  // this is a global variable

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

// Create users with different roles
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

// store said users to db
before(async function () {
  try {
      await User.deleteMany({});

      const admin = new User(adminData);
      await admin.save();

      const teacher = new User(teacherData);
      await teacher.save();

      const student = new User(studentData);
      await student.save();
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

before(function (done) {
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

before(function (done) {
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

before(function (done) {
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
    id = questionnaire._id;

    await questionnaire.save();
});

/*
* --  Functions  --
*/

function sendToServer(rawData, id, getStatus, status, user, done) {
  //console.log(user.getCookies())
    user.get('/questionnaires/edit/' + id)
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(getStatus);
            const csrfToken = '"' + extractCsrfToken(res) + '"';
            const data = rawData + csrfToken + ' }';

            if (res.statusCode == 403 && (user == studentUser || user == unauthorizedUser)) {
              done();
              return
            }

            user.post('/questionnaires/edit/' + id)
                .send(JSON.parse(data))
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.statusCode).to.equal(status);
                    done();
                });
        });
}

function validationSend(file, id, done) {
    const rawData = fs.readFileSync(fPath + file, 'utf8');
    sendToServer(rawData, id, 200, 409, adminUser, done);
}

function validationSendMore(file, id, getStatus, status, done) {
    const rawData = fs.readFileSync(fPath + file, 'utf8');
    sendToServer(rawData, id, getStatus, status, adminUser, done);
}


/*
* --  Tests  --
*/

/**
 * Tests for authentication when sending the edited questionnaire
 */


describe('Questionnaire updating authorization', function() {
    it('must let an admin to edit questionnaires', function (done) {

        const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
        sendToServer(rawData, id, 200, 200, adminUser, done);
    });

    it('must let a teacher to edit questionnaires', function (done) {

        const rawData = fs.readFileSync(fPath + '/teacherQuestionnaire.json', 'utf8');
        sendToServer(rawData, id, 200, 200, teacherUser, done);
    });

    it('must NOT let a student to edit questionnaires', function (done) {

        const rawData = fs.readFileSync(fPath + '/studentQuestionnaire.json', 'utf8');
        sendToServer(rawData, id, 302, 302, studentUser, done);
    });

    it('must NOT let a non-logged-in user to edit questionnaires', function (done) {

        const rawData = fs.readFileSync(fPath + '/studentQuestionnaire.json', 'utf8');
        sendToServer(rawData, id, 302, 302, unauthorizedUser, done);
    });

    it('must require a valid csrf token', function (done) {
        const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
        const csrfToken = '" "';
        const data = rawData + csrfToken + ' }';

        adminUser.post('/questionnaires/edit/' + id)
            .send(JSON.parse(data))
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.statusCode).to.equal(403);
                done();
            });
    });
});


/**
 * Tests for edited questionnaire validation
 */
describe('Questionnaire editing validation', function () {

    it('must be able to handle an empty questionnaire', function (done) {
        const file = 'emptyQuestionnaire.json';
        validationSend(file, id, done);
    });

    it('must be able to handle an empty title', function (done) {
        const file = 'emptyTitle.json';
        validationSend(file, id, done);
    });

    it('must be able to handle a too long title', function (done) {
        const file = 'tooLongTitle.json';
        validationSend(file, id, done);
    });

    it('must be able to handle incorrect submissions number', function (done) {
        const file = 'incorrectSubmissions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle a no questions situation', function (done) {
        const file = 'noQuestions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle a duplicate questions title', function (done) {
        const file = 'duplicateQuestions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle a no options situation', function (done) {
        const file = 'noOptions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle incorrect number of options', function (done) {
        const file = 'incorrectNumberOfOptions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle duplicate options', function (done) {
        const file = 'duplicateOptions.json';
        validationSend(file, id, done);
    });

    it('must be able to handle "true" options missing', function (done) {
        const file = 'trueOptionsMissing.json';
        validationSend(file, id, done);
    });

    it('must be able to handle incorrect max points', function (done) {
        const file = 'incorrectMaxPoints.json';
        validationSend(file, id, done);
    });

    it('must be able to handle xss', function (done) {
        const file = 'xss.json';
        validationSendMore(file, id, 200, 200, done);
    });

});
});
