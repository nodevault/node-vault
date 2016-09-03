'use strict';

var debug = require('debug')('node-vault');
var tv4 = require('tv4');
var commands = require('./commands.js');
var mustache = require('mustache');
var rp = require('request-promise');
var Promise = require('bluebird');

module.exports = function () {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // load conditional dependencies
  debug = config.debug || debug;
  tv4 = config.tv4 || tv4;
  commands = config.commands || commands;
  mustache = config.mustache || mustache;
  rp = config['request-promise'] || rp;
  Promise = config.Promise || Promise;
  var client = {};

  function handleVaultResponse(response) {
    // debug(response.statusCode);
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      return Promise.reject(new Error(response.body.errors[0]));
    }
    return Promise.resolve(response.body);
  }

  client.handleVaultResponse = handleVaultResponse;

  // defaults
  client.apiVersion = config.apiVersion || 'v1';
  client.endpoint = config.endpoint || process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
  client.token = config.token || process.env.VAULT_TOKEN;

  var requestSchema = {
    type: 'object',
    properties: {
      path: {
        type: 'string'
      },
      method: {
        type: 'string'
      }
    },
    required: ['path', 'method']
  };

  // Handle any HTTP requests
  client.request = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var valid = tv4.validate(options, requestSchema);
    if (!valid) return Promise.reject(tv4.error);

    var uri = client.endpoint + '/' + client.apiVersion + options.path;

    // Replace variables in uri.
    uri = mustache.render(uri, options.json);

    // Replace unicode encodings.
    uri = uri.replace(/&#x2F;/g, '/');
    debug(options.method, uri);

    options.headers = options.headers || {};
    options.headers['X-Vault-Token'] = client.token;
    options.uri = uri;
    options.json = options.json || true;
    options.simple = options.simple || false;
    options.resolveWithFullResponse = options.resolveWithFullResponse || true;

    // debug(options.json);

    return rp(options);
  };

  client.help = function (path, requestOptions) {
    debug('help for ' + path);
    var options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = '/' + path + '?help=1';
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.write = function (path, data, requestOptions) {
    debug('write %o to %s', data, path);
    var options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = '/' + path;
    options.json = data;
    options.method = 'PUT';
    return client.request(options).then(handleVaultResponse);
  };

  client.read = function (path, requestOptions) {
    debug('read ' + path);
    var options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = '/' + path;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.delete = function (path, requestOptions) {
    debug('delete ' + path);
    var options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = '/' + path;
    options.method = 'DELETE';
    return client.request(options).then(handleVaultResponse);
  };

  function generateFunction(name, conf) {
    client[name] = function () {
      var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var options = Object.assign({}, config.requestOptions, args.requestOptions);
      options.method = conf.method;
      options.path = conf.path;
      options.json = args;

      // Validate via json schema.
      if (conf.schema !== undefined) {
        var valid = true;
        if (conf.schema.query !== undefined) {
          valid = tv4.validate(options.json, conf.schema.query);
          if (valid) {
            var params = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = Object.keys(conf.schema.query.properties)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                if (key in options.json) {
                  params.push(key + '=' + encodeURIComponent(options.json[key]));
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            if (params.length > 0) {
              options.path += '?' + params.join('&');
            }
          }
        }
        if (valid && conf.schema.req !== undefined) {
          valid = tv4.validate(options.json, conf.schema.req);
        }
        if (!valid) {
          debug(tv4.error.dataPath);
          debug(tv4.error.message);
          return Promise.reject(tv4.error);
        }
      }

      return client.request(options).then(handleVaultResponse);
    };
  }

  client.generateFunction = generateFunction;

  // protecting global object properties from being added
  // enforcing the immutable rule: https://github.com/airbnb/javascript#iterators-and-generators
  // going the functional way first defining a wrapper function
  var assignFunctions = function assignFunctions(commandName) {
    return generateFunction(commandName, commands[commandName]);
  };
  Object.keys(commands).forEach(assignFunctions);

  return client;
};