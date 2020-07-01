/* eslint-disable sonarjs/no-duplicate-string */
'use strict';

const User = require('../models/user');

module.exports = {

    /**
     * Returns list of users
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async listUsers(request, response) {
        const users = await User.find()
            .sort('name')
            .select('name email role')
            .exec();
        response.render('user/users', { users });
    },

    /**
     * Returns a user with specific id
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async showUser(request, response) {
        const user = await User.findById(request.params.id).exec();

        if (!user) {
            request.flash(
                'errorMessage',
                `User not found (id: ${request.params.id})`
            );
            return response.redirect('/users');
        }

        response.render('user/user', { user });
    },

    /**
     * Returns users own info
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async showProfile(request, response) {
        const user = await User.findById(request.user.id).exec();

        if (!user) {
            throw new Error('User information not found');
        }

        response.render('user/user', {
            user,
            isProfile: true
        });
    },

    /**
     * Creates a new user
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async createUser(request, response) {
        const { error } = User.validateRegistration(request.body);
        // TODO: find out why ESLint thinks name is already defined
        //       This seems to be a bug in ESLint...
        // ESLint: 'name' is already declared in the upper scope
        // eslint-disable-next-line no-shadow
        const { name, email, password } = request.body;

        if (error) {
            if (request.is('json')) {
                return response.status(400).json({ error });
            }

            return response.render('user/register', {
                name,
                email,
                errors: error
            });
        }

        let user = await User.findOne({ email }).exec();

        if (user) {
            const errorMessage =
                'Email already registered for another user.';

            if (request.is('json')) {
                return response.status(409).json({
                    error: errorMessage
                });
            }

            return response.render('user/register', {
                name,
                email,
                errorMessage
            });
        }

        user = new User();
        user.name = name;
        user.email = email;
        user.password = password;

        await user.save();
        request.flash(
            'successMessage',
            'Registration ready, you can now log in.'
        );
        response.redirect('/users/login');
    },

    /**
     * Changes users role
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async processChangeRole(request, response) {
        if (request.params.id === request.user.id) {
            request.flash(
                'errorMessage',
                'You cannot change your own role.'
            );
            return response.redirect('/users');
        }

        const { error } = User.validateRole(request.body);

        if (error) {
            request.flash('errorMessage', 'Unknown role');
            return response.redirect('/users');
        }

        const user = await User.findById(request.params.id).exec();

        if (!user) {
            request.flash(
                'errorMessage',
                `User not found (id: ${request.params.id})`
            );
            return response.redirect('/users');
        }

        user.role = request.body.role;
        await user.save();

        request.flash('successMessage', 'Role successfully changed');
        response.redirect('/users');
    },

    /**
     * Returns a form to change users role
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async changeRole(request, response) {
        if (request.params.id === request.user.id) {
            request.flash(
                'errorMessage',
                'Changing your own role is not allowed.'
            );
            return response.redirect('/users');
        }

        const user = await User.findById(request.params.id).exec();
        const roles = User.getAvailableRoles();

        if (!user) {
            request.flash(
                'errorMessage',
                `User not found (id: ${request.params.id})`
            );
            return response.redirect('/users');
        }

        response.render('user/change_role', {
            user,
            roles,
            csrfToken: request.csrfToken()
        });
    },

    /**
     * Returns a form to remove a user
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async delete(request, response) {
        if (request.params.id === request.user.id) {
            request.flash(
                'errorMessage',
                'Removing user not allowed'
            );
            return response.redirect('/users');
        }

        const user = await User.findById(request.params.id).exec();

        if (!user) {
            request.flash(
                'errorMessage',
                `User not found (id: ${request.params.id})`
            );
            return response.redirect('/users');
        }

        response.render('user/delete', {
            user,
            csrfToken: request.csrfToken()
        });
    },

    /**
     * Removes a user with specific id
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async processDelete(request, response) {
        if (request.params.id === request.user.id) {
            request.flash(
                'errorMessage',
                'Removing user not allowed'
            );
            return response.redirect('/users');
        }

        await User.findByIdAndDelete(request.params.id).exec();
        request.flash('successMessage', 'User removed successfully.');
        response.redirect('/users');
    },

    /**
     * Returns a form to change users password
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    changePassword(request, response) {
        response.render('user/change_password', {
            name: request.user.name,
            csrfToken: request.csrfToken()
        });
    },

    /**
     * Returns a form to update user profile
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async updateProfile(request, response) {
        response.render('user/edit_user', {
            name: request.user.name,
            email: request.user.email,
            csrfToken: request.csrfToken()
        });
    },

    /**
     * Updates a users profile
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async processUpdateProfile(request, response) {
        const { error } = User.validateUpdate(request.body);
        // TODO: find out why ESLint thinks name is already defined
        //       This seems to be a bug in ESLint...
        // ESLint: 'name' is already declared in the upper scope
        // eslint-disable-next-line no-shadow
        const { name, email, password } = request.body;

        if (error) {
            if (request.is('json')) {
                return response.status(400).json({
                    error
                });
            }

            return response.render('user/edit_user', {
                name,
                email,
                csrfToken: request.csrfToken(),
                errors: error
            });
        }

        // Check password
        const match = await request.user.checkPassword(password);

        if (!match) {
            request.flash('errorMessage', 'Check your password and try again.');
            return response.redirect('/users/me');
        }

        if (request.user.email !== email) {
            // check if email is already registered
            const user = await User.findOne({ email }).exec();

            if (user) {
                const errorMessage =
                    'This email has been registered for another user.';

                if (request.is('json')) {
                    return response.status(409).json({
                        error: errorMessage
                    });
                }

                request.flash('errorMessage', errorMessage);
                return response.redirect('/users/me');
            }
        }

        const currentUser = request.user;
        currentUser.name = name;
        currentUser.email = email;
        await currentUser.save();

        request.flash(
            'successMessage',
            'The information of this profile is updated successfully'
        );

        response.redirect('/users/me');
    },

    /**
     * Returns a form for a user to login
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    login(request, response) {
        response.render('user/login');
    },

    /**
     * User logs out and gets redirected to a login page.
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    logout(request, response) {
        request.logout();
        request.flash('successMessage', 'You have logged out');
        response.redirect('/users/login');
    },

    /**
     * Returns a form for user to register
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    register(request, response) {
        response.render('user/register');
    }
};
