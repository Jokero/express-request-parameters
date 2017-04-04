'use strict';

const transformRequest = require('./transformRequest');
const ValidationError  = require('transformer-chain').plugins.validate.ValidationError;
const merge            = require('lodash.merge');

const DEFAULT_OPTIONS = {
    rawName: 'rawParameters',
    name: 'parameters',
    errorFactory: function(message, errors) {
        const err = new Error(message);
        err.status = 400;
        err.errors = errors;
        return err;
    },
    errorMessage: 'Bad Request'
};

/**
 * @param {Function|Object} schema
 * @param {Object}          [options]
 * @param {String}            [options.rawName=rawParameters]
 * @param {String}            [options.name=parameters]
 * @param {Function}          [options.errorFactory]
 * @param {Function|String}   [options.errorMessage]
 *
 * @returns {Function}
 */
module.exports = function middleware(schema, options) {
    options = Object.assign({}, DEFAULT_OPTIONS, middleware.options, options);

    return function(req, res, next) {
        req[options.rawName] = merge({}, req.query, req.body, req.params);

        const resolvedSchema = schema instanceof Function ? schema(req) : schema;

        transformRequest(req[options.rawName], resolvedSchema)
            .then(params => {
                req[options.name] = params;
                next();
            })
            .catch(err => {
                if (err instanceof ValidationError) {
                    const resolvedErrorMessage = options.errorMessage instanceof Function ? options.errorMessage(req) : options.errorMessage;
                    const validationErrors = err.errors;
        
                    const factoryError = options.errorFactory(resolvedErrorMessage, validationErrors);
        
                    return Promise.reject(factoryError);
                }
        
                return Promise.reject(err);
            })
            .catch(next);
    };
};