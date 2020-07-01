/* eslint-disable no-invalid-this */
'use strict';

const {
    Joi,
    mongoIdSchema,
    csrfTokenSchema
} = require('./validator');

// allow either of the keys 'id' or '_id' but not both
// (leave these optional and do not require either key)
const idInputSchema = {
    id: mongoIdSchema,
    _id: mongoIdSchema
};

// module.exports.optionInputSchemaconst optionInputSchema = Joi.object()
const optionInputSchema = Joi.object()
    .keys({
        option: Joi.string()
            .trim()
            .normalize()
            .min(1)
            .max(50)
            .regex(/^((?!\$).)*$/)
            .required()
            .error(() => {
                return 'Option must be given, it length is 1..50 chars.';
            }),
        hint: Joi.string()
            .trim()
            .normalize()
            .min(1)
            .max(100)
            .regex(/^((?!\$).)*$/)
            .empty('')
            .optional()
            .error(() => {
                return 'Hint may be 1..100 chars.';
            }),
        correctness: Joi.boolean()
            .truthy(['t', 'y', 'yes', '1', 1])
            .falsy(['f', 'n', 'no', '0', 0])
            .insensitive(true)
            .required()
    })
    .append(idInputSchema)
    .oxor('id', '_id');

const questionInputSchema = Joi.object()
    .keys({
        title: Joi.string()
            .trim()
            .normalize()
            .min(1)
            .max(100)
            .regex(/^((?!\$).)*$/)
            .required()
            .error(() => {
                return 'Title is required, it must be 1..100 chars.';
            }),
        maxPoints: Joi.number()
            .min(1)
            .integer()
            .required()
            .error(() => {
                return 'maxPoints are required, the number must be a positive integer.';
            }),
        options: Joi.array()
            .min(2)
            .items(optionInputSchema)
            .has(
                Joi.object({
                    option: Joi.string().required(),
                    hint: Joi.string().optional(),
                    correctness: Joi.boolean()
                        .valid(true)
                        .required()
                }).append(idInputSchema).oxor('id', '_id')
            )
            .required()
            .error(() => {
                return 'Two options must be given, one of the options must be correct.';
            })
    })
    .append(idInputSchema)
    .oxor('id', '_id');

const questionnaireInputSchema = Joi.object()
    .keys({
        title: Joi.string()
            .trim()
            .normalize()
            .min(1)
            .max(100)
            .regex(/^((?!\$).)*$/)
            .required()
            .error(() => {
                return 'Title is required, its length is 1..100 chars.';
            }),
        submissions: Joi.number()
            .min(1)
            .integer()
            .required()
            .error(() => {
                return 'Number of submissions must be defined, it must be a positive integer.';
            }),
        questions: Joi.array()
            .min(1)
            .items(questionInputSchema)
            .required()
            .error(() => {
                return 'Questionnaire must contain at least one question.';
            }),
        _csrf: csrfTokenSchema
    })
    .append(idInputSchema)
    .oxor('id', '_id');


module.exports.optionInputSchema = optionInputSchema;
module.exports.questionInputSchema = questionInputSchema;
module.exports.questionnaireInputSchema = questionnaireInputSchema;
