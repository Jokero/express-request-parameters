var transformRequest = require('./lib/transformRequest');
var _                = require('lodash');

/**
 * @param {Function}        paramsConfig
 * @param {Object}          [options]
 * @param {String}            [options.rawParamsName=rawParameters]
 * @param {String}            [options.paramsName=parameters]
 * @param {Function}          [options.errorFactory]
 * @param {String|Function}   [options.errorMessage]
 *
 * @returns {Function}
 */
function setParameters(paramsConfig, options) {
    options = Object.assign({}, setParameters.options, options);

    var errorMessageFunction = options.errorMessage instanceof Function ? options.errorMessage : function() {
        return options.errorMessage;
    };
    var errorFactory = options.errorFactory || function(message, errors) {
        var err = new Error(message);
        err.status = 400;
        err.errors = errors;
        return err;
    };

    var rawParamsName = options.rawParamsName || 'rawParameters';
    var paramsName    = options.paramsName || 'parameters';

    return function(req, res, next) {
        req[rawParamsName] = _.merge({}, req.query, req.body, req.params);

        transformRequest(req[rawParamsName], paramsConfig(req))
            .then(function(params) {
                req[paramsName] = params;
                next();
            })
            .catch(function(errors) {
                if (!(errors instanceof Error)) {
                    var errorMessage = errorMessageFunction(req);
                    var err          = errorFactory(errorMessage, errors);

                    return next(err);
                }

                next(errors);
            });
    };
}

setParameters.transformer = require('transformer-chain');

module.exports = setParameters;