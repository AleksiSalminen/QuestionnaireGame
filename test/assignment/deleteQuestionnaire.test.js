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

const fPath = 'test/assignment/testCreateQs/';

describe('Delete Questionnaire', function () {

function extractCsrfToken(res) {
    const htmlString = cheerio.load(res.text).html();
    const $ = cheerio.load(htmlString);

    return $("#\\_csrf").val()

}


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

/*
* --  User logins  --
*/

/*
* Log in as an admin
*/

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

let unauthorizedUser = request.agent(app);

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

async function sendToServerDelete(getStatus, status, user, done) {
    Questionnaire.find({title: "valid title"}).select('_id').exec( (err, id) => {
      id = id[0]._id;
      user.get('/questionnaires/delete/' + id)
          .end(function (err, res) {
              if (err) return done(err);
              expect(res.statusCode).to.equal(getStatus);
              if (res.statusCode == 302 && (user == studentUser || user == unauthorizedUser)) {
                  // If user is redirected, (s)he never gets the csrf token.
                  done();
                  return
              }

            user.set('X-csrf-token', extractCsrfToken(res))
                .delete('/questionnaires/delete/' + id)
                .send()
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.statusCode).to.equal(status);
                    done();
                });
    });

});


}


/*
* --  Tests  --
*/

/**
 * Tests for authentication when trying to delete a questionnaire
 */
describe('Questionnaire deletion authorization', function() {
    it('must let an admin to delete questionnaires', function (done) {
        sendToServerDelete(200, 200, adminUser, done);
    });

    it('must let a teacher to delete questionnaires', function (done) {
        sendToServerDelete(200, 200, teacherUser, done);
    });

    it('must NOT let a student to delete questionnaires', function (done) {
        sendToServerDelete(302, 302, studentUser, done);
    });

    it('must NOT let a not-logged-in person to delete questionnaires', function (done) {
        sendToServerDelete(302, 302, unauthorizedUser, done);
    });

    it('must require a valid csrf token', function (done) {
        const csrfToken = '" "';
        const rawData = fs.readFileSync(fPath + 'adminQuestionnaire.json', 'utf8');
        const data = rawData + csrfToken + ' }';
        let id = Questionnaire.find({title: questionnaireData.title}).select('_id').exec( (err, id) => {
            id = id[0]._id;
            adminUser.post('/questionnaires/edit/' + id)
                .send(JSON.parse(data))
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.statusCode).to.equal(403);
                    done();
                });
        });
    });
});
});
