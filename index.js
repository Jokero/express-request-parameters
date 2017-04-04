'use strict';

const middleware  = require('./lib/middleware');
const transformer = require('transformer-chain');

middleware.transformer = transformer;

module.exports = middleware;