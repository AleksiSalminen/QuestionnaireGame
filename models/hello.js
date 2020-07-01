'use strict';

module.exports = {
    grade(answer, maxPoints) {
        let points = 0;

        if (!Number.isInteger(maxPoints) || maxPoints < 2 || maxPoints % 2 !== 0) {
            // maxPoints must be an even positive integer
            // since it's divided by 2 below
            return points;
        }

        if (typeof answer !== 'string') {
            return points;
        }

        answer = answer.toLowerCase();

        if (answer.includes('hello')) {
            points += maxPoints / 2;
        }

        if (answer.includes('a+')) {
            points += maxPoints / 2;
        }

        return points;
    }
};
