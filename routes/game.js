'use strict';

const express = require('express');
const router = express.Router();
const GameController = require('../controllers/game');

router.get('/', GameController.showQuestionnaires)
router.get('/:id([a-f0-9]{24})', GameController.showGame);
router.post('/:id([a-f0-9]{24})', GameController.gradeGame);

module.exports = router;