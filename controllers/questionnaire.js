'use strict'

const Questionnaire = require('../models/questionnaire');
const xssFilters = require('xss-filters');

module.exports = {
    /**
     * List all documents by name
     * method: GET
     * route: /questionnaires
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async list(request, response) {
        const questionnaireTitles  = await Questionnaire.find()
            .sort('title')
            .select('title')
            .exec()
        response.render('management', { questionnaireTitles  });
    },

    /**
     * Show selected document
     * method: GET
     * route: /questionnaires/:id
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async show(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id)
            .sort('title')
            .exec()
        response.render('questionnaire', { questionnaire })
    },

    /**
     * Create document
     * method: GET
     * route: /questionnaires/new
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async create(request, response) {
        response.render('newQuestionnaire', { csrfToken: request.csrfToken() });
    },

    /**
     * method: POST
     * route: /questionnaires/new
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async processCreate(request, response) {
      let data = request.body;
      let filteredData = filterXSS(data);
      let xssFiltered = false;

      if(data !== filteredData) {
          xssFiltered = true;
      }

      data = filteredData;

      const questionnaireData = parseQuestionnaireFormData(data);

        if (questionnaireData === undefined) {
            var errorMessage =
                'Error creating a questionnaire';

            return response.status(409).render('newQuestionnaire', { csrfToken: request.csrfToken(), errorMessage });
        }

        var questionnaire = new Questionnaire();
        //questionnaire = JSON.stringify(questionnaireData);

        questionnaire.title = questionnaireData.title;
        questionnaire.questions = questionnaireData.questions;
        questionnaire.submissions = questionnaireData.submissions;

        var { error } = Questionnaire.validateQuestionnaire(questionnaireData);

        if (error) {
            var errorMessage =
                'Error creating a questionnaire';

            errorMessage += appendErrorneousQuestions(questionnaire.questions);

            questionnaire = JSON.stringify(questionnaire);

            // Lähetetään käyttäjälle virheilmoitus, että vääräntyyppinen kysely
            return response.status(409).render('editQuestionnaire', { questionnaire, csrfToken: request.csrfToken(), errorMessage });
        }

        let match = await Questionnaire.findOne({ title: questionnaire.title }).exec();
        if (match) {
            const errorMessage =
                'Another questionnaire already has this title. Use a different title';


            // Lähetetään käyttäjälle virheilmoitus, että on jo samanniminen kysely olemassa
            questionnaire = JSON.stringify(questionnaire);
            return response.status(409).render('editQuestionnaire', { questionnaire, csrfToken: request.csrfToken(), errorMessage });
        }

        if (isDuplicateQuestions(questionnaire.questions) == true) {
          const errorMessage =
              'Error! Having two equal question titles is not allowed.';



          questionnaire = JSON.stringify(questionnaire);
          return response.status(409).render('editQuestionnaire', { questionnaire, csrfToken: request.csrfToken(), errorMessage });

        }

        for (let i = 0; i < questionnaire.questions.length; i++) {
          if (isDuplicateOptions(questionnaire.questions[i].options)) {
            const errorMessage =
                'Error! Having multiple same options in a question is not allowed.'

            questionnaire = JSON.stringify(questionnaire);
            return response.status(409).render('editQuestionnaire', { questionnaire, csrfToken: request.csrfToken(), errorMessage });
          }
        }

        await questionnaire.save();

        const successMessage =
            'Questionnaire successfully created';

        const questionnaireTitles  = await Questionnaire.find()
            .sort('title')
            .select('title')
            .exec();

        // Lähetetään ilmoitus, että lisättiin kysely onnistuneesti
        response.render('management', { questionnaireTitles , successMessage });
    },

    /**
     * Update document
     * method: GET
     * route: /questionnaires/edit/:id
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async update(request, response) {
        const requestId = xssFilters.inHTMLData(request.params.id);
        let questionnaire = await Questionnaire.findById(requestId)
            .sort('title')
            .exec();

        if (!questionnaire) {
            const errorMessage =
                'No questionnaire with the given ID found';

            const questionnaireTitles  = await Questionnaire.find()
                .sort('title')
                .select('title')
                .exec();


            // Lähetetään käyttäjälle virheilmoitus, että ei löytynyt kyselyä kyseisellä ID:llä
            return response.status(409).render('management', { questionnaireTitles , errorMessage });
        }

        const id = questionnaire.id;
        const oldTitle = questionnaire.title;

        questionnaire = JSON.stringify(questionnaire);

        const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
        response.render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), edit });
    },

    /**
     * Update questionnaire
     * method: PUT
     * route: /questionnaires/edit/:id
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
     async processUpdate(request, response) {

         const requestId = xssFilters.inHTMLData(request.params.id);
         let questionnaire = await Questionnaire.findById(requestId)
             .sort('title')
             .exec();


         if (!questionnaire) {
             const errorMessage =
                 'No questionnaire with the given ID found';

             const questionnaireTitles  = await Questionnaire.find()
                 .sort('title')
                 .select('title')
                 .exec();

             // Lähetetään käyttäjälle virheilmoitus, että ei löytynyt kyselyä kyseisellä ID:llä
             return response.status(409).render('management', { questionnaireTitles , errorMessage });
         }

         const id = questionnaire.id;
         const qTitle = questionnaire.title;

         let data = request.body;

         let filteredData = filterXSS(data);
         let xssFiltered = false;

         if(data !== filteredData) {
             xssFiltered = true;
         }

         data = filteredData;

         const questionnaireData = parseQuestionnaireFormData(data);

         if (questionnaireData === undefined) {
             var errorMessage =
                 'Error editing the questionnaire';

             questionnaire = JSON.stringify(questionnaire);
             let oldTitle = questionnaire.title;
             const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
             return response.status(409).render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage, edit });
         }

         const oldTitle = questionnaireData.oldTitle;

         questionnaire.questions = questionnaireData.questions;
         questionnaire.submissions = questionnaireData.submissions;
         questionnaire.title = questionnaireData.title;


         // omitting IDs and oldTitle for validation
         let newquestionnaireData = {};
         newquestionnaireData.questions = questionnaireData.questions;
         newquestionnaireData.submissions = questionnaireData.submissions;
         newquestionnaireData.title = questionnaireData.title;


         let newQuestionnaire = new Questionnaire();
         newQuestionnaire = JSON.stringify(newquestionnaireData);

         var { error } = Questionnaire.validateQuestionnaire(newQuestionnaire);



         if (error) {
             var errorMessage =
                 'Error editing questionnaire';
             errorMessage += appendErrorneousQuestions(newquestionnaireData.questions);

             questionnaire = JSON.stringify(questionnaire);

             const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
             return response.status(409).render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage, edit });
             //return response.render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage });
         }


        if (isDuplicateQuestions(questionnaire.questions) == true) {
            const errorMessage =
                'Error! Having two equal question titles is not allowed.';

            questionnaire = JSON.stringify(questionnaire);

            const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
            return response.status(409).render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage, edit });
            //return response.render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage });
        }

        for (let i = 0; i < questionnaire.questions.length; i++) {
          if (isDuplicateOptions(questionnaire.questions[i].options)) {
            const errorMessage =
                'Error! Having multiple same options is not allowed.'

            questionnaire = JSON.stringify(questionnaire);

            const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
            return response.status(409).render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage, edit });
            //return response.render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage });
          }
        }

         if (questionnaire.title !== questionnaireData.oldTitle) {

             let match = await Questionnaire.findOne({ title: questionnaire.title }).exec();
             if (match) {
                 const errorMessage =
                     'Another questionnaire already has this title. Use a different title';

                 // Lähetetään käyttäjälle virheilmoitus, että on jo samanniminen kysely olemassa
                 questionnaire = JSON.stringify(questionnaire);

                 const edit = { edit: true };  // to make 'old title' visible in questionnaireForm -partial
                 return response.status(409).render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage, edit });
                 //return response.render('editQuestionnaire', { questionnaire, id, oldTitle, csrfToken: request.csrfToken(), errorMessage });
             }
         }

         await questionnaire.save();

         const successMessage =
             'Successfully edited questionnaire';

         const questionnaireTitles  = await Questionnaire.find()
             .sort('title')
             .select('title')
             .exec();

         // Lähetetään ilmoitus, että editoitiin kyselyä onnistuneesti
         response.render('management', { questionnaireTitles , successMessage });
     },

    /**
     * Delete document
     * method: GET
     * route: /questionnaires/delete/:id
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async delete(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id)
            .sort('title')
            .exec();

        if (!questionnaire) {
            const errorMessage =
                'No questionnaire with the given ID found';

            const questionnaireTitles  = await Questionnaire.find()
                .sort('title')
                .select('title')
                .exec();

            // Lähetetään käyttäjälle virheilmoitus, että ei löytynyt kyselyä kyseisellä ID:llä
            return response.render('management', { questionnaireTitles , errorMessage });

        }

        response.render('deleteQuestionnaire', { questionnaire, csrfToken: request.csrfToken() });
    },

    /**
     * Deletes a questionnaire with a specific id
     * method: DELETE
     * route: /questionnaires/delete/:id
     *
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async processDelete(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id)
            .sort('title')
            .exec();

        await Questionnaire.findByIdAndDelete(request.params.id).exec();

        const successMessage =
            'Successfully deleted the questionnaire: "' + questionnaire.title + '"';

        const questionnaireTitles  = await Questionnaire.find()
            .sort('title')
            .select('title')
            .exec();

        request.flash('successMessage', 'Questionnaire removed successfully.');
        response.setHeader('content-type', 'text/plain');
        response.send('/questionnaires');
    }
};

function appendErrorneousQuestions(questions) {
    var errors = "";
    for (let i = 0; i < questions.length; i++) {
        for (let k = 0; k <= questions[i].options.length; k++) {
            if (k == questions[i].options.length) {
                if (errors == "") {
                    errors += " At least one option needs to be correct! (Question(s) " + i;
                }
                else { errors += ", " + i; }
            }

            else if (questions[i].options[k].correctness == 'true' || questions[i].options[k].correctness == true) {
                break;
            }
        }
    }

    if (errors != "") {
        errors += ")";
    }

    return errors
}

function filterXSS(data) {
    try {

        for (let n = 0; n < Object.keys(data.questions).length; n++) {
            for (let m = 0; m < Object.keys(data.questions[n]).length - 2; m++) {
                data.questions[n][m].option = xssFilters.inHTMLData(data.questions[n][m].option);
                data.questions[n][m].correctness = xssFilters.inHTMLData(data.questions[n][m].correctness);

                if(data.questions[n][m].hint !== undefined) {
                    data.questions[n][m].hint = xssFilters.inHTMLData(data.questions[n][m].hint);
                }
                else {
                    data.questions[n][m].hint = "";
                }
            }

            data.questions[n].question = xssFilters.inHTMLData(data.questions[n].question);
            data.questions[n].maxPoints = xssFilters.inHTMLData(data.questions[n].maxPoints);
        }

        if (data.oldTitle) {
            data.oldTitle = xssFilters.inHTMLData(data.oldTitle);
        }

        data.submissions = xssFilters.inHTMLData(data.submissions);
        data.questionnaire_title = xssFilters.inHTMLData(data.questionnaire_title);

        return data;

    } catch (Exception) {
        return data;
    }
}

function parseQuestionnaireFormData(data) {

    /*
            How to eat request data:

            Questionnaire
            -> request.body;
                example:  { questionnaire_title: 'title',
                            submissions: '1',
                            questions:
                                [ { '0': [Object], '1': [Object], question: 'q0', maxPoints: '1' } ]
                          }


            Question n
            -> request.body.questions[n]
                example:  { '0': { option: 'o0', correctness: 'true', hint: 'h0' },
                            '1': { option: 'o1', correctness: 'false', hint: 'h1' },
                            question: 'q0',
                            maxPoints: '1' }


            Option m of question n
            -> request.body.questions[n][m]
                example: { option: 'o0', correctness: 'true', hint: 'h0' }


            field "fieldName" of option m
            -> request.body.questions[n][m].fieldName
                example: 'true'

    */

    /*
        request.body

        { questionnaire_title: 'title',
          submissions: '1',
          questions:
            [ {
                {
                '0': { option: 'o0', correctness: 'true', hint: 'h0' },
                '1': { option: 'o1', correctness: 'false', hint: 'h1'},
                question: 'q0',
                maxPoints: '1'
                },
                { ... }
            } ]
        }

    ------------
        Schema

        { title: 'title',
          submissions: '1',
          questions:
            [
                { title: 'q_title',
                  maxPoints: '1',
                  options:
                    [
                        { option: 'o0', correctness: 'true', hint: 'h0' }
                        { option: 'o1', correctness: 'false', hint: 'h1'}
                    ]
                }
            ]
        }
    */
    try {
/*
        let data = request.body;

        let oldTitle = data.oldTitle;
*/
        let questionnaireData = {};
        let questions = [];

        for (let n = 0; n < Object.keys(data.questions).length; n++) {
            let options = [];

            for (let m = 0; m < Object.keys(data.questions[n]).length - 2; m++) {
                options.push(data.questions[n][m]);

            }

            questions.push({
                title: data.questions[n].question,
                maxPoints: data.questions[n].maxPoints,
                options: options
            });

        }

        if (data.oldTitle) {
            questionnaireData.oldTitle = data.oldTitle;
        }

        questionnaireData.questions = questions;
        questionnaireData.submissions = data.submissions;
        questionnaireData.title = data.questionnaire_title;

        return questionnaireData;

    } catch (Exception) {
        return undefined;
    }
}

function isDuplicateQuestions(questions) {
    for (let i = 0; i < questions.length; i++) {
        for (let k = i+1; k < questions.length; k++) {
            if (questions[k].title == questions[i].title) {
                // duplicate found
                return true
            }
        }
    }
  // duplicates not found
  return false;
}

function isDuplicateOptions(options) {
  for (let i = 0; i < options.length; i++) {
      for (let k = i+1; k < options.length; k++) {
        if (options[k].option == options[i].option) {
            // duplicate found
            return true
        }
      }
  }
// duplicates not found
return false;
}
