'use strict';

require('dotenv').config();
const debug = require('debug')('bwa:app');
const createError = require('http-errors');
const express = require('express');
const hbs = require('express-handlebars');
const hbsHelpers = require('handlebars-helpers')();
const path = require('path');
const helmet = require('helmet');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const config = require('config');

// NOTE: This must be required BEFORE calling express()
//       as in: const app = express()
// https://www.npmjs.com/package/express-async-errors
require('express-async-errors');

const dbConfig = config.get('mongo');
const sessionConfig = config.get('session');
const app = express();


// connect to database
const db = require('./models/db');
db.connectDB(dbConfig);

// setup admin user
// !Done!   TODO: pass config with the right key to add admin user
require('./setup/createusers')(config.get('admin')).then((msg) => {
    debug(msg);
});

if (app.get('env') === 'development') {
    app.use(logger('dev'));

    // insert sample data to database
    require('./setup/createdata')().then((msg) => {
        debug(msg);
    });
}

// trust reverse proxy headers
// (needed when behind apache/nginx reverse proxy)
app.set('trust proxy', true);

// view engine setup
app.set('view engine', 'hbs');

// configure the view engine
app.engine(
    'hbs',
    hbs({
        extname: 'hbs',
        helpers: hbsHelpers,
        defaultLayout: 'default',
        layoutsDir: path.join(__dirname, '/views/layouts/'),
        partialsDir: path.join(__dirname, '/views/partials/')
    })
);

// configure views path
app.set('views', path.join(__dirname, '/views'));

// helmet middleware
app.use(helmet());

const staticFileOptions = {
    dotfiles: 'ignore',
    etag: true,
    fallthrough: true,
    lastModified: true,
    maxAge: app.get('env') === 'development' ? '1m' : '2d'
};

const distDir = path.resolve(`${__dirname}/`, 'dist');
const publicDir = path.resolve(`${__dirname}/`, 'public');

// static content middleware
// (frontend assets such as css, images, client side javascript, etc.)
app.use(express.static(distDir, staticFileOptions));
app.use(express.static(publicDir, staticFileOptions));

// session middleware
app.use(session(sessionConfig));

// passport authentication middleware
require('./middleware/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
    // set auhentication and role related variables to a views
    response.locals.isAuthenticated = request.isAuthenticated();
    response.locals.isAdmin = false;
    response.locals.isTeacher = false;
    response.locals.isStudent = false;

    if (request.isAuthenticated()) {
        response.locals.isAdmin = request.user.isAdmin;
        response.locals.isTeacher = request.user.isTeacher;
        response.locals.isStudent = request.user.isStudent;
        response.locals.username = request.user.name;
        response.locals.userId = request.user.id;
    }

    next();
});

// flash messages
app.use(flash());
app.use((request, response, next) => {
    // pass flash messages to view variables
    response.locals.successMessage = request.flash('successMessage');
    response.locals.errorMessage = request.flash('errorMessage');
    response.locals.error = request.flash('error');
    response.locals.success = request.flash('success');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// send app to router
require('./router.js')(app);
console.log("Router activated");

// catch 404 and forward to error handler
// NOTE: this middleware must be defined after all other routes
app.use(function(request, response, next) {
    next(createError(404));
});

// error handler
app.use(function(error, request, response, next) {
    // set locals, only providing error in development
    response.locals.message = error.message;
    response.locals.error =
        request.app.get('env') === 'development' ? error : {};
    response.locals.title = `${error.status || 500} ${error.message}`;
    response.locals.heading = `${request.method} ${request.url}`;

    // send response
    response.status(error.status || 500);
    if (request.baseUrl !== '/api') return response.render('error');

    response.json({
        message: response.locals.message,
        error: response.locals.error
    });
});

module.exports = app;
