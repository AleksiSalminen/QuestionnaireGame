'use strict';

const loginUrl = '/users/login';

module.exports = {
    ensureAuthenticated(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        }
        request.flash('errorMessage', 'Login required');
        response.redirect(loginUrl);
    },

    ensureAdmin(request, response, next) {
        if (!request.isAuthenticated() || !request.user) {
            request.flash(
                'errorMessage',
                'Admin rights required: login'
            );
            return response.redirect(loginUrl);
        }

        // TODO: do the checking
        if (!request.user.isAdmin) {
          request.flash('errorMessage', 'Admin rights required');
          return response.redirect('/');
        }

        next();
    },

    ensureTeacher(request, response, next) {
        if (!request.isAuthenticated() || !request.user) {
            request.flash(
                'errorMessage',
                'Teacher rights required: login'
            );
            return response.redirect(loginUrl);
        }

        if (!request.user.isTeacher) {
            request.flash('errorMessage', 'Teacher rights required');
            return response.redirect('/');
        }

        next();
    },

    ensureStudent(request, response, next) {
        if (!request.isAuthenticated() || !request.user) {
            request.flash(
                'errorMessage',
                'Student rights required: login'
            );
            return response.redirect(loginUrl);
        }

        if (!request.user.isStudent) {
            request.flash('errorMessage', 'Student rights required');
            return response.redirect('/');
        }

        next();
    },

    // Fail when request.param.id === request.user.id
    ensureNotSelf(request, response, next) {
        if (request.user && request.params.id && request.user.id === request.params.id) {
            request.flash(
                'errorMessage',
                'Modify your data through profile'
            );
            return response.redirect('/');
        }

        next();
    },

    forwardAuthenticated(request, response, next) {
        if (!request.isAuthenticated()) {
            return next();
        }
        response.redirect('/');
    }
};
