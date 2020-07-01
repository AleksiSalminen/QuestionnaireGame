'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, verifyLogin));

    // save userId to session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // load user to request.user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};

async function verifyLogin(email, password, done) {
    const errorMessage =
        'Login failed. Check email and password.';

    // Validate user input
    const { error } = User.validateLogin({ email, password });
    if (error) return done(null, false, errorMessage);

    // Check if the user with given email actually exists
    const user = await User.findOne({ email }).exec();
    if (!user) return done(null, false, errorMessage);

    // Check password
    const match = await user.checkPassword(password);
    if (!match) return done(null, false, errorMessage);

    return done(null, user, 'Login succeeded');
}
