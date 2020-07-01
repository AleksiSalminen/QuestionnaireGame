/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
'use strict';

require('dotenv').config();
const config = require('config');
const mongoose = require('mongoose');
const dbConfig = config.get('mongo');

const User = require('../models/user')


/**
 * Run before all tests
 */

before('Global Before All', async () => {
    const clearDb = async () => {
        for (const i in mongoose.connection.collections) {
            await mongoose.connection.collections[i].deleteMany({});
        }

    if (mongoose.connection.readyState === 0) {
        await mongoose
            .connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true
            });

        mongoose.connection.on('error', (err) => {
            console.error(err);
        });

        mongoose.connection.on('reconnectFailed', (err) => {
            throw err;
        });


        return await clearDb();
    } else {
        return await clearDb();
    }
}});

/**
 * Run after all tests
 */

after('Global After All', (done) => {
    mongoose.disconnect();
    done();
});
