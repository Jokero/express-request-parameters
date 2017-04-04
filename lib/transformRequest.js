'use strict';

const transformer = require('transformer-chain');

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Promise}
 */
module.exports = function(object, schema) {
    return transformer(object, schema)
        .default()
        .filter()
        .validate()
        .project()
        .result;
};