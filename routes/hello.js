'use strict';

const express = require('express');
const router = express.Router();
const HelloController = require('../controllers/hello');

router.get('/', HelloController.showExercise);
router.post('/', HelloController.gradeExercise);

module.exports = router;
