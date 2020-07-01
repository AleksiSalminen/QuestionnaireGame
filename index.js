/* eslint-disable no-process-exit */
/* eslint-disable no-console */

// ESLint: This is the only file where exiting is allowed
//         and console usage is acceptable outside development
'use strict';

/**
 * Module dependencies.
 */

const app = require('./app');
const debug = require('debug')('bwa:server');
const http = require('http');

/**
 * Error handling outside express server
 */

// Make the script exit on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not
// handled will terminate the Node.js process with a non-zero exit code.
// Also there really is nothing that can be done to recover if execution
// ends up outside express.
process.on('unhandledRejection', (err, p) => {
    // TODO: implement better logging and log the error properly and
    //       not (only) to the console
    console.error(p);
    throw err;
});

// Exit the script if there is an uncaught exception outside express
process.on('uncaughtException', (err) => {
    // TODO: implement better logging and log the error properly and
    //       not (only) to the console
    console.error(err);
    process.exit(1);
});

/**
 * Get port from environment and store in Express.
 */

const serverListenPort = normalizePort(process.env.PORT || '3000');
app.set('port', serverListenPort);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(serverListenPort);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const port = app.get('port');
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    if (error.code === 'EACCES') {
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
    } else if (error.code === 'EADDRINUSE') {
        console.error(`${bind} is already in use`);
        process.exit(1);
    } else {
        throw error;
    }

}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}
