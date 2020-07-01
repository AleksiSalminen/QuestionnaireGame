'use strict';

module.exports = async userConfig => {

    const User = require('../models/user');

    const admin = await User.findOne({ role: 'admin' }).exec();

    if (admin) {
        return 'Admin not created: at least one admin user already found in database.';
    }

    // FIXME: Fails when a non-admin user with same email already exists in the database
    // Fixed LOL

    const user = new User(userConfig);

    const found = await User.findOne({email: user.email}).exec();

    if (found == null) {
      user.role = 'admin';
      await user.save();
      return 'Admin user successfully created';
    }
    else {
      return 'Error! Another user with the specified e-mail address already exists.'
    }

};
