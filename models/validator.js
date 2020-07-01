'use strict';

const Joi = require('@hapi/joi');

module.exports = {
    Joi,

    buildErrorObject(errors) {
        if (!Array.isArray(errors)) throw new Error(`Expected an array but received: "${typeof errors}"`);

        if (Array.isArray(errors.details)) {
            errors = errors.details;
        }

        const messages = {};

        errors.forEach((err) => {
            // see: https://eslint.org/docs/rules/no-prototype-builtins
            if (Object.prototype.hasOwnProperty.call(messages, err.path)) {
                return;
            }

            messages[err.path] = err.message;
        });

        return messages;
    },

    mongoIdSchema: Joi.string()
        .trim()
        .length(24)
        .regex(/^[a-fA-F0-9]{24}$/),

    // NOTE: Does not really validate or protect from CSRF.
    // Use csurf middleware to validate CSRF tokens
    // Only checks the existense of the key and strips the value from the results
    csrfTokenSchema: Joi.string()
        .trim()
        .min(1)
        .strip()
};
