# express-request-parameters

Middleware for processing request data (setting default values, filtering, validation).
It's useful in HTTP API when you want to process client input.
The processing itself is performed by [transformer-chain](https://github.com/Jokero/transformer-chain) module.

[![NPM version](https://img.shields.io/npm/v/express-request-parameters.svg)](https://npmjs.org/package/express-request-parameters)
[![Build status](https://img.shields.io/travis/Jokero/express-request-parameters.svg)](https://travis-ci.org/Jokero/express-request-parameters)

**Note:** This module works in Node.js >= 4.0.

## Installation

```sh
npm install express-request-parameters
```

## Usage

### expressRequestParameters(schema, [options])

**Parameters**

* `schema` (Function | Object) - Schema which defines how to process request data (req.query, req.body and req.params are merged and processed as one object)
* `[options]` (Object)
  - `[name=parameters]` (String) - Specifies where to set processed data in `req` object
  - `[rawName=rawParameters]` (String) - Specifies where to set raw data (before processing) in `req` object
  - `[errorFactory]` (Function) - Factory for error creation on validation error
  - `[errorMessage=Bad Request]` (String | Function) - Error message

**Return value**

(Function) - (req, res, next) middleware

### Overview

Imagine you want to allow users to create books in your REST API. And book looks like this:

```js
const book = {
    name: 'The Adventures of Tom Sawyer', // required field
    author: {
        name: 'Mark Twain' // required
    },
    reviews: [
        {
            author: 'Leo Tolstoy',
            text: 'Great novel',
            visible: true
        },
        {
            author: 'Fyodor Dostoyevsky',
            text: 'Very interesting'
        }
    ]
};
```

And before creating book you may want to check that client sent valid data. You can do it by defining schema 
(take a look at [transformer-chain](https://github.com/Jokero/transformer-chain) to see all features).

```js
const bookSchema = {
    name: {
        $filter: 'trim', // trims only strings
        $validate: {
            required: true, // mark as required field
            string: true
        }
    },
    author: {
        $validate: { // you can omit check that "author" value is object, it will be done internally 
            required: true
        },
        
        name: {
            $filter: 'trim',
            $validate: {
                required: true,
                string: true
            }
        }
    },
    reviews: [{ // define schema for array items
        author: {
            $filter: 'trim',
            $validate: {
                required: true,
                string: true
            }
        },
        text: {
            $filter: 'trim',
            $validate: {
                required: true,
                string: true
            }
        },
        visible: {
            $default: true, // default value will be set when actual value of property is undefined
            $filter: 'toBoolean' // always returns boolean
        }
    }]
};
```

Then you need just pass this schema to `express-request-parameters`:

```js
const express    = require('express');
const parameters = require('express-request-parameters');
const bookSchema = require('./bookSchema');

const app = express();

app.post('/books', parameters(bookSchema), function(req, res, next) {
  // req.parameters is processed input data
});
```

If you want to use another from `parameters` name just use `name` option:

```js
app.post('/books', parameters(bookSchema, { name: 'book' }), function(req, res, next) {
  // use req.book instead of req.parameters
});
```

You can specify default options:

```js
// config.js
const parameters = require('express-request-parameters');
parameters.options = { 
    name: '$params'
};

// app.js
app.post('/books', parameters(bookSchema), function(req, res, next) {
  // use req.$params instead of req.parameters
});
```

When you have validation error middleware will call `next` with error object which looks like this:

```js
const err = new Error('Bad Request'); 
err.status = 400;
err.errors = errors; // validation errors
```

You can change error message (`Bad Request`) by using `errorMessage` option:

```js
// config.js
const parameters = require('express-request-parameters');
parameters.options = { 
    errorMessage: 'Validation Error' 
};

// or it can be a function
parameters.options = { 
    errorMessage: function(req) { // you can use req object if needed
        return 'Validation Error';
    } 
};
```

Or you can even specify your custom `errorFactory`:

```js
// config.js
const parameters = require('express-request-parameters');
parameters.options = { 
    errorFactory: function(message, validationErrors) {
        const err = new Error(message);
        err.status = 400;
        err.validationErrors = validationErrors;
        return err;
    }
};
```

If you need to do something with validators/filters (add new for example), you can use `transformer`:

```js
const parameters = require('express-request-parameters');

parameters.transformer.plugins.validate.validators.newValidator = function(value, options) {
    /* validator implementation */
};
```

## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)
