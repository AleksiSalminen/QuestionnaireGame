'use strict';

const { Joi, buildErrorObject } = require('./validator');
const defaultValues = {
    page: 1,
    limit: 25
};

const paginationSchema = Joi.object().keys({
    page: Joi.number()
        .min(1)
        .integer()
        .default(defaultValues.page),
    limit: Joi.number()
        .min(25)
        .max(100)
        .integer()
        .valid([25, 50, 100])
        .default(defaultValues.limit)
});

module.exports.validatePagination = (options) => {
    const result = Joi.validate(options, paginationSchema, {
        abortEarly: false
    });

    if (result.error) {
        const errors = buildErrorObject(result.error);

        for (const key in errors) {
            result.value[key] = defaultValues[key];
        }
    }

    return result.value;
};
