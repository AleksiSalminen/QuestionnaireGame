# Questionnaire Game

The application gamifies multi-choice questionnaire.
The project consists of three parts: the game, management view, and testing/documentation.
The application was made by three people, as a programming course's project work.

## Game

The game can be accessed only when you are logged in. There is a link to the game in the navigation bar and
clicking it gets you to the /games page where there is button for each questionnaire title. When clicking
the questionnaire title button you are directed to /games/id page where id is the id of the questionnaire.
You can start the game by clicking the start button. Each question is answered seperately by clicking for
all the right options. In each question you can choose as many options as there are right answers and
after that the correct options turn green and wrong options red. Your selected answers also have wider borders
so you can check which options you have clicked. After that you can proceed to the next question by clicking
the next button. The game only works for questionnaires where you get one point from each right option.
However there can be as many options, correct options and questions as you like. The points and maximum points
are also shown in the screen and updated after each question When all the questions are answered
there is a grade button which sends the grades to the grader.

## Management view

The management view is only accessible to teachers and administrators. In the management view it is possible
to list all the questionnaires and see their options, create new questionnaires, update the existing
questionnaires and delete existing questionnaires.
The management view is accessible from the "Exercises" tab, which directs to /questionnaires, the
managemet view's front page. On the management view's front page all the questionnaires are listed
one below another, and on the top is a search field. By typing on the search field, the questoinnaires are
filtered by titles that match the text in the search field.

At the bottom of the page, there is a "Create new questionnaire"-button, and by pressing it, the user is directed
to questionnaire creation page, /questionnaires/new, where it is possible to create new questionnaires. The user
can submit the questionnaire by pressing the "Submit"-button. After this, the creation is either accepted,
and the user gets directed back to the management view's front page, or there is something wrong with the set options,
in which case, an error message is shown to the user.

In the management view's front page, the user can choose a specific questionnaire by clicking the title of the
questionnaire, which directs user to /questionnaires/id, where id is the 24-character id of the questionnaire.
In the /questionnaires/id page the user sees all the questions and the options of the questions of the questionnaire.
At the bottom of the page, there is an option for the user to remove the questionnaire and an option to edit the
questionnaire.

By clicking the "Remove"-button the user gets directed to /questionnaires/delete/id, where if the user clicks the
"Remove"-button, the questionnaire gets deleted, and the user is directed back to the management view's main page.

By clicking the "Edit"-button, the user gets directed to /questionnaires/edit/id page. This page is identical to the
questionnaire creation page, but the existing settings are already in place, and there is the "Old title"-feature,
where the user can see the old title of the questionnaire. After having made the possible changes, the user can click the
"Submit"-button, and then the editing is either accepted and the user gets directed back to the management view's front
page, or there is something wrong with the set options, and the user is given an error message.

## Tests and documentation

There are tests in four files:

    * createQuestionnaire.test.js

    * deleteQuestionnaire.test.js

    * readQuestionnaire.test.js

    * updateQuestionnaire.test.js


CreateQuestionnaire and updateQuestionnaire -tests also uses the files from /assignment/testCreateQs -directory. These are different inputs, some of which are valid and some invalid. The names should explain what is inside.

All of the tests in these files test the CRUD operations. The connection is self explanatory.

The tests aretesting the Questionnaire controller and router's functionality. The router should be able to keep unauthorized users (not logged in, student, invalid csrf token) from making any changes to the database or reading the data.

It should also keep the input safe (XSS filtering), and not let the user input invalid data.
___
### CREATE

File: createQuestionnaire.test.js

Test cases:

  Authorization

    * must let an admin to create new questionnaires

    * must let a teacher to create new questionnaires

    * must NOT let a student to create new questionnaires

    * must NOT let a non-logged-in user to edit questionnaires

    * must require a valid csrf token

  Invalid input:

    * must be able to handle an empty questionnaire

    * must be able to handle an empty title

    * must be able to handle a too long title

    * must be able to handle a duplicate title

    * must be able to handle incorrect submissions number

    * must be able to handle a no questions situation

    * must be able to handle a duplicate questions title

    * must be able to handle a no options situation

    * must be able to handle incorrect number of options

    * must be able to handle duplicate options

    * must be able to handle "true" options missing

    * must be able to handle incorrect max points

    * must be able to handle xss


___
### READ

File: readQuestionnaire.test.js

Test cases:

  Listing questionnaires:

    * Admin should be able to list questionnaires

    * Teacher should be able to list questionnaires

    * Student should NOT be able to list questionnaires

    * Non-logged-in user should NOT be able to list questionnaires

  Listing questions:

    * Admin should be able to show questions

    * Teacher should be able to show questions

    * Student should NOT be able to show questions

    * Non-logged-in user should NOT be able to show questions


___
### UPDATE

File: updateQuestionnaire.test.js

Test cases:

  Authorization:

    * must let an admin to edit questionnaires

    * must let a teacher to edit questionnaires

    * must NOT let a student to edit questionnaires

    * must NOT let a non-logged-in user to edit questionnaires

    * must require a valid csrf token

  Invalid input:

    * must be able to handle an empty questionnaire

    * must be able to handle an empty title

    * must be able to handle a too long title

    * must be able to handle incorrect submissions number

    * must be able to handle a no questions situation

    * must be able to handle a duplicate questions title

    * must be able to handle a no options situation

    * must be able to handle incorrect number of options

    * must be able to handle duplicate options

    * must be able to handle "true" options missing

    * must be able to handle incorrect max points

    * must be able to handle xss


___
### DELETE

File: deleteQuestionnaire.test.js

Test cases:

  Authorization:

    * must let an admin to delete questionnaires

    * must let a teacher to delete questionnaires

    * must NOT let a student to delete questionnaires

    * must NOT let a not-logged-in person to delete questionnaires

    * must require a valid csrf token

## Security concerns

Sending data:
The POST method is used for sending sensitive data from the client to the server.

Preventing XSS:
XSS Filters is used to sanitize received input.

Setting headers:
Helmet is used to set various security-related HTTP response headers.

Preventing CSRF:
CSRF tokens are created using CSURF, and sent to the client. Sending and checking
CSRF tokens applies to all operations that result in data modification on the server.

Preventing NoSQL injections:
Joi is used in conjunction with Mongoose to validate the input, so NoSQL injections
shouldn't get past the validation.

Input validation:
Joi and Mongoose are used to check whether the received input adheres the defined
model for data to be saved to the database.

Storing passwords:
All the passwords are hashed with Bcrypt before saving them to the database.

Access control:
Passport and CSRF tokens are used to authenticate users when they are trying to access
the application's features.

---
## Coding conventions

Project uses _express_ web app framework (https://expressjs.com/).
The application starts from `index.js` that in turn calls other modules.  
The actual _express_ application is created and configured in `app.js` and
routes in `router.js`.

The application complies with the _MVC_ model, where each route has
a corresponding _controller_ in the dir of `controllers`.
Controllers, in turn, use the models for getting and storing data.
The models centralize the operations of e.g. validation, sanitation
and storing of data (i.e., _business logic_) to one location.
Having such a structure also enables more standard testing.

As a _view_ component, the app uses _express-handlebars_;
actual views are put in the dir named `views`. It has two subdirectories:
`layouts` and `partials`.
`layouts` are whole pages, whereas `partials` are reusable smaller
snippets put in the `layouts` or other views. Views, layouts, and partials
use _handlebars_ syntax, and their extension is `.hbs`.
More information about _handlebars_ syntax can be found in: http://handlebarsjs.com/

Files such as images, _CSS_ styles, and clientside JavaScripts are under the `public` directory. When the app is run in a browser, the files are located under the`/`path, at the root of the server, so the views must refer to them using the absolute path. (For example, `<link rel =" stylesheet "href =" / css / style.css ">`) ** Note that `public` is not part of this path. **

The _mocha_ and _chai_ modules are used for testing and the tests can be found under the `test` directory.

## The project structure

```
.
├── app.js                  --> express app
├── index.js                --> bwa app
├── router.js               --> main router
├── package.json            --> app info and dependencies
├── config                  --> configuration settings
│   ├── custom-environment-variables.json --> custom environment variables settings
│   ├── default.json        --> default database and session settings
│   └── test.json           --> settings for tests
├── controllers             --> controllers (handle e.g. routing)
│   ├── hello.js            --> the same as "minimal viable grader"
│   ├── game.js             --> game controller
│   ├── user.js             --> user controller
│   └── questionnaire.js    --> questionnaire controller
├── middleware              --> other application middleware
│   ├── auth.js             --> authentication checking
│   ├── passport.js         --> login validation
│   └── webpack.js          --> webpack configuration
├── models                  --> models that reflect the db schemes
│   │                           and take care of storing data
│   ├── db.js               --> database model
│   ├── hello.js            --> hello grader model
│   ├── pagination.js       --> pagination model
│   ├── questionnaire.input.js --> model for questionnaire input
│   ├── questionnaire.js    --> questionnaire model
│   ├── user.js             --> user model
│   └── validator.js        --> validator model
├── public                  --> location for public (static) files
│   ├── img                 --> for images
│   ├── js                  --> for javascript
│   │   ├── deleteHelper.js --> helper for deletion
│   │   └── questionnaireScript.js --> script for questionnaire editing/creation (in the client)
│   └── css                 --> for styles
│       ├── style.css       --> basic styles
│       └── styles.css      --> styles for the game and management view
├── routes                  --> a dir for router modules
│   ├── hello.js            --> / (root) router
│   ├── questionnaire.js    --> router for CRUD operations
│   ├── game.js             --> /game router
│   └── users.js            --> /users router
├── setup                   --> setting up application
│   ├── createdata.js       --> create sample data
│   ├── createusers.js      --> create sample users
│   └── game.questionnaire.json --> sample questionnaire configuration
├── views                   --> views - visible parts
│   ├── error.hbs           --> error view
│   ├── hello.hbs           --> main view - "minimal viable grader"
│   ├── hello-graded.hbs    --> view when hello has been graded
│   ├── games.hbs           --> view for selecting the questionnaire to play
│   ├── game.hbs            --> view for the actual game where you answer the questions
│   ├── game-graded.hbs     --> view when game has been graded
│   ├── management.hbs      --> the main management view
│   ├── questionnaire.hbs   --> view for the specific questionnaire
│   ├── deleteQuestionnaire.hbs --> view for questionnaire deletion
│   ├── editQuestionnaire.hbs --> view for editing questionnaire
│   ├── newQuestionnaire.hbs --> view for creation of questionnaire
│   ├── user                --> views for user and registration handling
│   │   ├── change_password.hbs --> view for changing password
│   │   ├── change_role.hbs --> view for changing user role
│   │   ├── delete.hbs      --> view for deleting a user
│   │   ├── edit_user.hbs   --> view for editing a user
│   │   ├── login.hbs       --> view for logging in
│   │   ├── register.hbs    --> view for registering
│   │   ├── user.hbs        --> view for user info
│   │   └── users.hbs       --> view for info about users
│   ├── layouts             --> layouts - handlebar concept
│   │   └── default.hbs     --> default view
│   └── partials            --> smaller handlebar components to be included in views
│       ├── bootstrap_scripts.hbs --> bootstrap scripts
│       ├── csrf.hbs        --> component for storing the csrf token
│       ├── grader_meta.hbs --> component for grader html meta information
│       ├── messages.hbs    --> component for messages
│       ├── navigation.hbs  --> navigation bar component
│       ├── pagination.hbs  --> pagination component
│       ├── questionnaireForm.hbs --> questionnaire form component
│       ├── stylesheets.hbs --> style sheets component
│       ├── user_info.hbs   --> component for displaying user info
│       └── user_listing.hbs --> component for listing users
└── test                    --> tests
    ├── .eslintrc.json      --> eslint configuration
    ├── mocha.opts          -->	mocha options
    ├── setup.test.js       --> setup for the tests
    ├── integration         --> integration tests
    │       ├── hello.reply.test.js --> test for validating hello reply
    │       ├── hello.test.js --> test for validating hello page
    │       ├── security.test.js --> test for application security
    │       └── users.test.js --> test for user validation, logging in and registering
    ├── models              --> unit tests for models
    │       ├── db.test.js  --> test for database
    │       ├── hello.test.js --> hello grader model test
    │       ├── questionnaire.test.js --> test for questionnaire model
    │       └── user.test.js --> user model test
    └── assignment          --> CRUD tests
            ├── createQuestionnaire.test.js --> test for questionnaire creation
            ├── deleteQuestionnaire.test.js --> test for deleting a questionnaire
            ├── readQuestionnaire.test.js --> test for reading a questionnaire
            ├── updateQuestionnaire.test.js --> test for updating a questionnaire
            ├── management.test.js --> test for management view
            ├── testCreateQs --> JSON files for questionnaire creation tests
            │        └── ...
            └── testUpdateQs --> JSON files for questionnaire editing tests
                     └── ...


```
