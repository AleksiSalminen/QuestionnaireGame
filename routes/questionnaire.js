'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: false });

const router = express.Router();
const QuestionnaireController = require('../controllers/questionnaire');

router.use(auth.ensureTeacher);

// View documents
router.get('/', csrfProtection, QuestionnaireController.list);
router.get('/:id([a-f0-9]{24})', csrfProtection, QuestionnaireController.show);

// Create documents
router.get('/new', csrfProtection, QuestionnaireController.create);
router.post('/new', csrfProtection, QuestionnaireController.processCreate);

// Update documents
router.get('/edit/:id([a-f0-9]{24})', csrfProtection, QuestionnaireController.update);
router.post('/edit/:id([a-f0-9]{24})', csrfProtection, QuestionnaireController.processUpdate);

// Delete documents
router.get('/delete/:id([a-f0-9]{24})', csrfProtection, QuestionnaireController.delete);
router.delete('/delete/:id([a-f0-9]{24})', csrfProtection, QuestionnaireController.processDelete);

module.exports = router;
