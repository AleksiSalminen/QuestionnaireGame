'use strict';

const Questionnaire = require('../models/questionnaire');

module.exports = {
    /**
     * Prints the questionnaire selection page
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async showQuestionnaires(request, response) {
        const questionnaire_titles = await Questionnaire.find()
            .sort('title')
            .select('title')
            .exec()
        response.render('games', { questionnaire_titles });
    },
    /**
     * Prints the game page
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async showGame(request, response) {

        var questionnaire = await Questionnaire.findById(request.params.id)
            .sort('title')
            .exec()

            questionnaire = await JSON.stringify(questionnaire);

        response.render('game', { questionnaire });
    },

    /**
     * gradeGame returns a grade for the quiz game
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */

    gradeGame(request, response) {

        let pointsArray = request.body.grade.split('/');
        let points = pointsArray[0];
        let maxPoints = pointsArray[1];
        response.render('game-graded', {
            points: points,
            maxPoints: maxPoints,
            status: 'graded',
            description: 'grading succesful',
            title: 'Quiz game'
        });
    }
};
