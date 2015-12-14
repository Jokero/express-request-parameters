var transformer = require('transformer-chain');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Promise}
 */
module.exports = function(object, config) {
    return transformer(object, config)
        .setDefaults()
        .filter()
        .validate({ maxPropertyErrorsCount: 1 })
        .clean()
        .result;
};