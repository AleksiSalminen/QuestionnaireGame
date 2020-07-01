'use strict';

// load routers
const GameRouter = require('./routes/game');
const UsersRouter = require('./routes/users');
const HelloRouter = require('./routes/hello');
const QuestionnaireRouter = require('./routes/questionnaire');
const express = require('express');

// Setup Routes
module.exports = function(app) {
    app.use('/games', GameRouter);
    app.use('/users', UsersRouter);
    app.use('/questionnaires', QuestionnaireRouter);
    app.use('/', HelloRouter);
    app.use('/public', express.static('public'))
};
