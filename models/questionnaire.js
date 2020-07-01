/* eslint-disable no-invalid-this */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {
    Joi,
    buildErrorObject
} = require('./validator');


const inputValidator = require('./questionnaire.input');

const optionSchema = new Schema({
    option: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    hint: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    correctness: {
        type: Boolean,
        required: true
    }
});

optionSchema.pre('validate', function(next) {
    if (typeof this.hint !== 'string') return next();
    if (this.hint.trim().length === 0) this.hint = undefined;
    next();
});

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    maxPoints: {
        type: Number,
        min: 1,
        required: true,
        validate: Number.isInteger
    },
    options: {
        type: [optionSchema],
        required: true,
        validate: {
            validator: (val) => {
                if (!val || !Array.isArray(val)) return false;
                if (val.length < 2) return false;

                const uniqueOptions = [];
                val.forEach((current) => {
                    if (!current.option) return;
                    const option = current.option.trim().toLowerCase();

                    if (uniqueOptions.includes(option)) return;
                    uniqueOptions.push(option);
                });

                if (uniqueOptions.length !== val.length) return false;

                return val.some((current) => {
                    return current.correctness;
                });
            },
            message:
                'Question must have a minimum of two unique answer options and at least one correct answer'
        }
    }
});

const questionnaireSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
        unique: true // NOTE: this is not a validator (see mongoose documentation)
    },
    submissions: {
        type: Number,
        min: 1,
        required: true,
        validate: Number.isInteger
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: (val) => {
                if (!val || !Array.isArray(val)) return false;
                if (val.length === 0) return false;

                const uniqueQuestions = [];
                val.forEach((current) => {
                    if (!current.title) return;
                    const title = current.title.trim().toLowerCase();

                    if (uniqueQuestions.includes(title)) return;
                    uniqueQuestions.push(title);
                });

                return uniqueQuestions.length === val.length;
            },
            message: 'Questionnaire must have at least one question and question titles must be unique'
        }
    }
});

questionnaireSchema.statics.validateOption = function(option) {
    const result = Joi.validate(option, inputValidator.optionInputSchema, {
        abortEarly: false
    });

    if (result.error) result.error = buildErrorObject(result.error.details);
    return result;
};

questionnaireSchema.statics.validateQuestion = function(question) {
    const result = Joi.validate(question, inputValidator.questionInputSchema, {
        abortEarly: false
    });

    if (result.error) result.error = buildErrorObject(result.error.details);
    return result;
};

questionnaireSchema.statics.validateQuestionnaire = function(questionnaire) {
    const result = Joi.validate(questionnaire, inputValidator.questionnaireInputSchema, {
        abortEarly: false
    });

    if (result.error) result.error = buildErrorObject(result.error.details);
    return result;
};

questionnaireSchema.statics.validateSearch = function(params) {
    const searchInputSchema = Joi.object().keys({
        title: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .regex(/^((?!\$).)*$/)
            .optional()
    });

    const result = Joi.validate(params, searchInputSchema);
    if (result.error) result.error = buildErrorObject(result.error.details);
    return result;
};

questionnaireSchema.set('toJSON', { versionKey: false });
const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
module.exports = Questionnaire;
