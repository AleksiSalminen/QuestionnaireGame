/* eslint-disable no-unused-expressions */
'use strict';

const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;

const User = require('../../models/user');
const testEmail = 'testcase@tuni.fi';
const testEmail2 = 'o.o@oolioo.com';
const testEmail3 = 'postia@sahkoposti.fi';
const testEmail4 = 'vilma.valkky@tuni.fi';
const testName= 'Vilma Välkky';
const teacherEmail='opettaja@sahkoposti.com';

function createTestString(strLength, character = 'a') {
    return new Array(strLength + 1).join(character);
}

describe('User', function() {
    describe('getAvailableRoles()', function() {});

    // eslint-disable-next-line sonarjs/cognitive-complexity
    describe('Input validation', function() {
        describe('validateLogin()', function() {
            it('must define email', function() {
                const testUser = {
                    password: 'testi12345'
                };
                const err = User.validateLogin(testUser).error;
                assert(err && err.email, 'testUser does not define an email, however, no error was received');
            });

            it('must define a valid email', function() {
                const testUser = {
                    email: 'testcasetuni.fi',
                    password: 'testi12345'
                };
                const err = User.validateLogin(testUser).error;
                assert(err && err.email, 'email of testUser is not valid - there must be an error');
            });

            it('must define password', function() {
                const testUser = {
                    email: testEmail
                };
                const err = User.validateLogin(testUser).error;
                assert(err && err.password, 'testUser does not define a password, however, no error was received');
            });

            it('must not allow an empty password', function() {
                const testUser = {
                    email: testEmail,
                    password: ''
                };
                const err = User.validateLogin(testUser).error;
                assert(err && err.password, 'password cannot be empty - an error must be received');
            });

            // no need to restrict password length during login
            // (registration on the other hand must have a minimum password length
            //  but NOT very restrictive maximum length since passwords must be hashed anyways)
            it('must have a password of length 1-100', function() {
                const testUser = {
                    email: 'testcase@tuni.fi',
                    password: ''
                };

                let err = User.validateLogin(testUser).error;
                assert(err && err.password, 'password must not be empty - an error must be received');

                testUser.password = createTestString(1);
                err = User.validateLogin(testUser).error;
                assert(!err, 'one character password is accepted');

                testUser.password = createTestString(100);
                err = User.validateLogin(testUser).error;
                assert(!err, '100 character password is accepted');

                testUser.password = createTestString(101);
                err = User.validateLogin(testUser).error;
                assert(err && err.password, 'password must not be over 100 characters - there must be error');
            });
        });

        describe('validateRegistration()', function() {
            it('must define "name"', function() {
                const testRegistration = {
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.name, 'must require name');
            });

            it('trims spaces from "name"', function() {
                // eslint-disable-next-line no-shadow
                const name = ' Oskari Olematon ';
                const testRegistration = {
                    name: name,
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const { error, value } = User.validateRegistration(testRegistration);
                assert(!error, 'must trim trailing spaces');
                assert.strictEqual(name.trim(), value.name, 'must trim trailing spaces');
            });

            it('must not allow "name" with spaces only', function() {
                const testRegistration = {
                    name: '      ',
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.name, 'name must not comprise only spaces - there must be an error');
            });

            it('must require "name" to be at least one char long', function() {
                const testRegistration = {
                    name: '',
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                let err = User.validateRegistration(testRegistration).error;
                assert(err && err.name, 'name must be at least one character long');
                const testRegistration2 = {
                    name: 'a',
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                err = User.validateRegistration(testRegistration2).error;
                assert(!err, 'name is allowed to be one character long');
            });

            it('must not allow "name" > 50 characters', function() {
                const testRegistration = {
                    name: createTestString(51),
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.name, 'name must be at most 50 characters long');
            });

            it('must not allow a dollar sign ($) inside "name"', function() {
                const testRegistration = {
                    name: 'sadfj$$HK',
                    email: testEmail2,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.name, 'name must not contain $ char');
            });

            it('must require an "email"', function() {
                const testRegistration = {
                    name: testName,
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.email, 'email must be included in the registration');
            });

            it('must require "email" to be valid email address', function() {
                const testRegistration = {
                    name: testName,
                    email: 'o.ooolioo.com',
                    password: 'ohhoh12345',
                    passwordConfirmation: 'ohhoh12345'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.email, 'must require a valid email');
            });

            it('must require "password"', function() {
                const testRegistration = {
                    name: testName,
                    email: testEmail2,
                    passwordConfirmation: 'ohhoh'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.password, 'password must be included');
            });

            it('must not allow empty "password"', function() {
                const testRegistration = {
                    name: testName,
                    email: testEmail2,
                    password: '',
                    passwordConfirmation: ''
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.password, 'must not allow an empty password');
            });

            it('must require minimum "password" length of 10 characters', function() {
                const testRegistration = {
                    name: testName,
                    email: testEmail2,
                    password: 'ohhoh',
                    passwordConfirmation: 'ohhoh'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.password, 'must require at least 10 chars in password');
            });

            it('must require "passwordConfirmation" to match "password"', function() {
                const testRegistration = {
                    name: testName,
                    email: testEmail2,
                    password: 'oho1234567',
                    passwordConfirmation: 'oho12345678'
                };
                const err = User.validateRegistration(testRegistration).error;
                assert(err && err.passwordConfirmation, 'password and confirmation do not match');
            });
        });

        describe('validateRole()', function() {
            it('must require "role"', function() {
                const testRole = {};
                const err = User.validateRole(testRole).error;
                assert(err && err.role, 'must require role');
            });

            it('must not allow empty "role"', function() {
                const testRole = {
                    role: ''
                };
                const err = User.validateRole(testRole).error;
                assert(err && err.role, 'must not allow empty role');
            });

            it('must allow any known "role"', function() {
                const testRoles = ['student', 'teacher', 'admin'];
                testRoles.forEach(function(role) {
                    const testRole = {
                        role: role
                    };
                    const err = User.validateRole(testRole).error;
                    assert(!err, `known role ${role} must be accepted`);
                });
            });

            it('must trim "role"', function() {
                const testRoles = ['   student', 'teacher  ', ' admin '];
                testRoles.forEach(function(role) {
                    const testRole = {
                        role: role
                    };
                    const err = User.validateRole(testRole).error;
                    assert(!err, `must trim "${role}"`);
                });
            });

            it('must handle "role" case-insensitively', function() {
                const testRoles = ['Student', 'teacHER', 'ADMIN'];
                testRoles.forEach(function(role) {
                    const testRole = {
                        role: role
                    };
                    const err = User.validateRole(testRole).error;
                    assert(!err, `"role" ${role} was not handled case-insensitively`);
                });
            });

            it('must not allow unknown "role"', function() {
                const testRoles = ['elephant', 'lion', 'horse'];
                testRoles.forEach(function(role) {
                    const testRole = {
                        role: role
                    };
                    const err = User.validateRole(testRole).error;
                    assert(err && err.role, `must not allow unknown "role" such as ${role}`);
                });
            });
        });

        describe('validateUpdate()', function() {
            it('must require "name"', function() {
                const testUpdate = {
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.name, 'must require name');
            });

            it('must trim spaces from "name"', function() {
                const testUpdate = {
                    name: '  testName  ',
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const { error, value } = User.validateUpdate(testUpdate);
                assert(!error, 'must accept name with spaces around it');
                assert.strictEqual(value.name, 'testName', 'must trim spaces from name');
            });

            it('must not allow "name" to have only spaces', function() {
                const testUpdate = {
                    name: '   ',
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.name, 'must not allow name to have only spaces');
            });

            it('must require "name" to be at least one character long', function() {
                const testUpdate = {
                    name: '',
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.name, 'must  require name to be at least one charcter long');
            });

            it('must not allow "name" to be longer than 50 characters', function() {
                const testNameCreate = createTestString(51);
                const testUpdate = {
                    name: testNameCreate,
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.name, 'must not allow name.lenght > 50');
            });

            it('must not allow a dollar sign ($) inside "name"', function() {
                const testUpdate = {
                    name: 'Vilma$$Välkky',
                    email: testEmail2,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.name, 'must not allow a dollar sign inside name');
            });

            it('must require "email"', function() {
                const testUpdate = {
                    name: testName,
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.email, 'must require email');
            });

            it('must require "email" to be a valid email address', function() {
                const testUpdate = {
                    name: testName,
                    email: 'o.ooolioo.com',
                    password: 'oho1234567'
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.email, 'must require email to be a valid email address');
            });

            it('must require a password', function() {
                const testUpdate = {
                    name: testName,
                    email: testEmail2
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.password, 'must require a password');
            });

            it('must not allow empty password', function() {
                const testUpdate = {
                    name: testName,
                    email: testEmail2,
                    password: ''
                };
                const err = User.validateUpdate(testUpdate).error;
                assert(err && err.password, 'must not allow empty password');
            });
        });
    });

    describe('Schema validation', function() {
        it('must define "name"', function() {

            const namelessUser = new User({
                email: teacherEmail,
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            const error = namelessUser.validateSync();
            expect(error).to.exist;
        });

        it('must trim spaces from "name"', function() {
            const TrimmedUser = new User({
                name: '  Anton Aurinkoinen  ',
                email: teacherEmail,
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            assert.strictEqual(TrimmedUser.name, 'Anton Aurinkoinen');
        });

        it('must not allow "name" to have only spaces', function() {
            const spaceNameUser = new User({
                name: '    ',
                email: teacherEmail,
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            const error = spaceNameUser.validateSync();
            expect(error).to.exist;
        });

        it('must require "name" to be at least one character long', function() {
            const nameWithoutCharacters = new User({
                name: '',
                email: teacherEmail,
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            const error = nameWithoutCharacters.validateSync();
            expect(error).to.exist;
        });

        it('must not allow "name" to be longer than 50 characters', function() {
            const longNameUser = new User({
                name: createTestString(51),
                email: teacherEmail,
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            const error = longNameUser.validateSync();
            expect(error).to.exist;
        });

        it('must require "email"', function() {
            const emaillessUser = new User({
                name: 'Leena',
                password: 'SuperTurvallinen',
                role: 'teacher'
            });

            const error = emaillessUser.validateSync();
            expect(error).to.exist;
        });

        it('must require "email" to be valid email address', function() {
            const fakeEmailUser = new User({
                name: 'Pekka',
                email: 'hopopopo',
                password: 'SuperTurvallinen',
                role: 'student'
            });

            const error = fakeEmailUser.validateSync();
            expect(error).to.exist;
        });

        it('must require "password"', function() {
            const passwordlessUser = new User({
                name: 'Liinu',
                email: 'sahkoposti@gmail.com',
                role: 'teacher'
            });
            const error = passwordlessUser.validateSync();
            expect(error).to.exist;
        });

        it('must not allow empty "password"', function() {
            const emptyPasswordUser = new User({
                name: 'Leenu',
                email: 'posti@sahkoposti.fi',
                password: '',
                role: 'admin'
            });

            const error = emptyPasswordUser.validateSync();
            expect(error).to.exist;
        });

        it('must hash password', function() {
            const hashedUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: 'student'
            });
            expect(hashedUser.password).to.not.equal('salattu');
        });

        it('has an optional "role"', function() {
            const rolelessUser = new User({
                name: 'Tupu',
                email: testEmail3,
                password: 'salaperaisyys'
            });

            const error = rolelessUser.validateSync();
            expect(error).to.be.undefined;
        });

        it('must set default value of "role" to student', function() {
            const defaultRoleUser = new User({
                name: 'Hupu',
                email: testEmail3,
                password: 'salaperaisyys'
            });

            expect(defaultRoleUser.role).to.equal('student');
        });

        it('must allow any known "role"', function() {
            const studentUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: 'student'
            });

            const error1 = studentUser.validateSync();
            expect(error1).to.be.undefined;

            const teacherUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: 'teacher'
            });

            const error2 = teacherUser.validateSync();
            expect(error2).to.be.undefined;

            const adminUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: 'admin'
            });

            const error3 = adminUser.validateSync();
            expect(error3).to.be.undefined;
        });

        it('must trim "role"', function() {
            const roleTrimUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: '   admin    '
            });

            expect(roleTrimUser.role).to.equal('admin');
        });

        it('must cast "role" to lowercase', function() {
            const lowerCaseUser = new User({
                name: 'Tiinu',
                email: testEmail3,
                password: 'salattu',
                role: 'STUDENT'
            });

            expect(lowerCaseUser.role).to.equal('student');
        });

        it('must not allow unknown "role"', function() {
            const unknownUser = new User({
                name: 'HerraTuntematon',
                email: testEmail3,
                password: 'salattu',
                role: 'maalari'
            });

            const error = unknownUser.validateSync();
            expect(error).to.exist;

        });
    });

    describe('User document', function() {
        // virtual properties (isStudent, isTeacher, isAdmin)
        describe('virtual getters/properties', function() {
            describe('isStudent', function() {
                it('must return true when role is a student', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'student'
                    });
                    const ret = testUser.isStudent;
                    assert(ret, 'must return true for a student role');
                });

                it('must return true when "role" is admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'admin'
                    });
                    const ret = testUser.isStudent;
                    assert(ret, 'must return true for an admin role');
                });

                it('must return false when a role is neither student nor admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'teacher'
                    });
                    const ret = testUser.isStudent;
                    assert(!ret, 'must return false when a role is neither student nor admin');
                });
            });

            describe('isTeacher', function() {
                it('must return true when role is a teacher', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'teacher'
                    });
                    const ret = testUser.isTeacher;
                    assert(ret, 'must return true for a teacher role');

                });

                it('must return true when role is an admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'admin'
                    });
                    const ret = testUser.isTeacher;
                    assert(ret, 'must return true for an admin role');

                });

                it('must return false when role is neither teacher nor admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'student'
                    });
                    const ret = testUser.isTeacher;
                    assert(!ret, 'must return false when a role is neither teacher nor admin');
                });
            });

            describe('isAdmin', function() {
                it('must return true when role is an admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'admin'
                    });
                    const ret = testUser.isAdmin;
                    assert(ret, 'must return true for a teacher role');
                });

                it('must return false when the role is not an admin', function() {
                    const testUser = new User({
                        name: testName,
                        email: testEmail4,
                        password: '1234567890',
                        role: 'teacher'
                    });
                    const ret = testUser.isAdmin;
                    assert(!ret, 'must return false when the role is not an admin');
                });
            });
        });

        describe('Password setter and hashing', function() {
            it('must hash "password" when new User is constructed', function() {
                const password = '1234567890';

                const testUser = new User({
                    name: testName,
                    email: testEmail4,
                    password: password,
                    role: 'teacher'
                });
                assert(testUser.password !== password, 'The password must be hashed');

                const filename = 'models/user.js';
                const lines = require('fs').readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
                const usesBcrypt = lines.some(function(line) {
                    return line.includes('bcrypt');
                });
                assert(usesBcrypt, 'bcrypt must be used');
            });

            it('must hash "password" when set to a new value', function() {
                const password = '1234567890';
                const testUser = new User({
                    name: testName,
                    email: testEmail4,
                    password: password,
                    role: 'teacher'
                });
                const password2 = 'heippaMaailma';
                testUser.password = password2;
                assert(testUser.password !== password2, 'The password must be hashed');
            });

            it('must detect correct "password"', async function() {
                const password = '1234567890';
                const testUser = new User({
                    name: testName,
                    email: testEmail4,
                    password: password,
                    role: 'teacher'
                });
                const ret = await testUser.checkPassword(password);
                assert(ret && password !== testUser.password, 'must return the set password');
            });

            it('must detect a false "password"', async function() {
                const password = '1234567890';
                const testUser = new User({
                    name: testName,
                    email: testEmail4,
                    password: password,
                    role: 'teacher'
                });

                const ret = await testUser.checkPassword('simsalabim');
                assert(!ret, 'must detect a false password');
            });
        });
    });
});
