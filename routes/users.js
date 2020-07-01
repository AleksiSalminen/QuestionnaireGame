'use strict';

const express = require('express');
const passport = require('passport');
const auth = require('../middleware/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: false });

const router = express.Router();
const UserController = require('../controllers/user');


// Register user
router
    .route('/register')
    .all(auth.forwardAuthenticated)
    .get(UserController.register)
    .post(UserController.createUser);


// Login user
router
    .route('/login')
    .all(auth.forwardAuthenticated)
    .get(UserController.login)
    .post((req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true,
            successFlash: true
        })(req, res, next);
    });


// Logout
router.get('/logout', UserController.logout);


// Show all users (for admins only)
router.get('/', auth.ensureAdmin, UserController.listUsers);


// Delete user (for admins only)
router
    .route('/delete/:id([a-f0-9]{24})')
    .all(
        auth.ensureAdmin, // only admins can delete users
        auth.ensureNotSelf, // no one can delete themselves
        csrfProtection // CSRF protection
    )
    .get(UserController.delete)
    .post(UserController.processDelete);


// View own profile
router.get('/me', auth.ensureAuthenticated, UserController.showProfile);

// Edit own profile
router
    .route('/me/edit')
    .all(
        auth.ensureAuthenticated, // only authenticated users can edit their settings
        csrfProtection // CSRF protection
    )
    .get(UserController.updateProfile)
    .post(UserController.processUpdateProfile);

// Change user role
router
    .route('/change-role/:id([a-f0-9]{24})')
    .all(
        auth.ensureAdmin, // only admins can change roles
        auth.ensureNotSelf, // no one can change their own role
        csrfProtection // CSRF protection
    )
    .get(UserController.changeRole)
    .post(UserController.processChangeRole);

// View user profile data (admin view)
router
    .route('/:id([a-f0-9]{24})')
    .all(auth.ensureAdmin)
    .get(UserController.showUser);


module.exports = router;
