'use strict';

const chai = require('chai');
const expect = chai.expect;

const Hello = require('../../models/hello');

describe('Hello', function() {
    describe('grade()', function() {
        it('should return 0 (zero) if answer is not a string', function() {
            const answers = [1, null, undefined, {}, [], true, Symbol(), NaN];
            const maxPoints = 2;

            answers.forEach((answer) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(0);
            });
        });

        it('should return 0 (zero) if maxPoints is not an integer', function() {
            const answer = 'HELLO A+';
            const points = [
                '',
                1.1,
                null,
                undefined,
                {},
                [],
                true,
                Symbol(),
                NaN
            ];

            points.forEach((maxPoints) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(0);
            });
        });

        it('should return 0 (zero) if "maxPoints < 2"', function() {
            const answer = 'HELLO A+';
            const points = [-1, 0, 1];

            points.forEach((maxPoints) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(0);
            });
        });

        it('should return 0 (zero) if "maxPoints is an odd number (not divisible by 2)"', function() {
            const answer = 'HELLO A+';
            const points = [3, 5, 7];

            points.forEach((maxPoints) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(0);
            });
        });

        it('should return 0 (zero) when answer is empty', function() {
            const answer = '';
            const maxPoints = 2;

            const grade = Hello.grade(answer, maxPoints);
            expect(grade).to.equal(0);
        });

        it('should return 0 (zero) when answer does not contain either "A+" or "HELLO"', function() {
            const answer = 'x';
            const maxPoints = 2;

            const grade = Hello.grade(answer, maxPoints);
            expect(grade).to.equal(0);
        });

        it('should return maxPoints/2 when answer contains "A+" but not "HELLO"', function() {
            const answers = ['a+', 'A+', ' a+', 'A+ ', ' a+ ', 'aA+a+Aa'];
            const maxPoints = 2;

            answers.forEach((answer) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(maxPoints / 2);
            });
        });

        it('should return maxPoints/2 when answer contains "HELLO" but not "A+"', function() {
            const answers = [
                'hello',
                'HELLO',
                ' hello',
                'HELLO ',
                ' hello ',
                'aAHelLoAa'
            ];
            const maxPoints = 2;

            answers.forEach((answer) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(maxPoints / 2);
            });
        });

        it('should return maxPoints when answer contains both "A+" and "HELLO"', function() {
            const answers = [
                'helloa+',
                'A+HELLO',
                'A+ hello',
                'HELLO a+',
                ' a+ hello ',
                'aA+HelLoAa'
            ];
            const maxPoints = 2;

            answers.forEach((answer) => {
                const grade = Hello.grade(answer, maxPoints);
                expect(grade).to.equal(maxPoints);
            });
        });
    });
});
