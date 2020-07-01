'use strict';

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const config = require('../config/webpack.config');
const compiler = webpack(config);

module.exports = (app) => {
    app.use(
        webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
            clientLogLevel: 'error'
        })
    );
};
