/*
* TODO: tests to test the 'READ' operation of CRUD.
* Not sure how to do it here, or why.
* Maybe test the authorization.
* This test should, too, start the server automatically, when this test
* is run.
*/

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

describe('Read Questionnaire', function () {

/*
*
* TODO:
* 1. make a test, that tries to access questionnaire editing,
* while not being logged in
* Implement this in the 'Questionnaire updating authorization' test area
*/

var id;  // this is a global variable
const fPath = 'test/assignment/testUpdateQs/';


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
    email: 'student@email.fi',
    password: '1234567890'
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
    id = questionnaire._id;

    await questionnaire.save();
});

/*
* --  Functions  --
*/

function sendToServerList(getStatus, user,  done) {
    user.get('/questionnaires')
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(getStatus);
            // const csrfToken = '"' + extractCsrfToken(res) + '"';
            // const data = rawData + csrfToken + ' }';

            done();
    });
}

function sendToServerShow(id, getStatus, user,  done) {
    user.get('/questionnaires/' + id)
        .end(function (err, res) {
            if (err) return done(err);
            expect(res.statusCode).to.equal(getStatus);
            // const csrfToken = '"' + extractCsrfToken(res) + '"';
            // const data = rawData + csrfToken + ' }';

            done();
    });
}


/*
* --  Tests  --
*/

/**
 * Tests for authentication when sending the edited questionnaire
 */


describe('Listing questionnaires', function() {
  it('Admin should be able to list questionnaires.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerList(200, adminUser, done);
  });

  it('Teacher should be able to list questionnaires.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerList(200, teacherUser, done);
  });

  it('Student should NOT be able to list questionnaires.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerList(302, studentUser, done);
  });

  it('Non-logged-in user should NOT be able to list questionnaires.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerList(302, unauthorizedUser, done);
  });
});

describe('Showing questions', function() {
  it('Admin should be able to show questions.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerShow(id, 200, adminUser, done);
  });

  it('Teacher should be able to show questions.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerShow(id, 200, teacherUser, done);
  });

  it('Student should NOT be able to show questions.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerShow(id, 302, studentUser, done);
  });

  it('Non-logged-in user should NOT be able to show questions.', function (done) {
      //const rawData = fs.readFileSync(fPath + '/adminQuestionnaire.json', 'utf8');
      sendToServerShow(id, 302, unauthorizedUser, done);
  });
});
});
