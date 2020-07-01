'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('bwa:mongo');

function connectDB(dbConfig) {

    mongoose
        .connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        .then(() => {
            mongoose.connection.on('error', (err) => {
                debug(err);
            });

            mongoose.connection.on('reconnectFailed', handleCriticalError);
        })
        .catch(handleCriticalError);
}

function handleCriticalError(err) {
    debug(err);
    throw err;
}

function disconnectDB(){
    mongoose.disconnect();
}


module.exports = {connectDB, disconnectDB};
