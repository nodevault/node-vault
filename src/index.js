'use strict';

let debug = require('debug')('node-vault');
let tv4 = require('tv4');
let commands = require('./commands.js');
let mustache = require('mustache');
let rp = require('request-promise');
let Promise = require('bluebird');

module.exports = (config = {}) => {
  // load conditional dependencies
  debug = config.debug || debug;
  tv4 = config.tv4 || tv4;
  commands = config.commands || commands;
  mustache = config.mustache || mustache;
  rp = config['request-promise'] || rp;
  Promise = config.Promise || Promise;
  const client = {};


  function handleVaultResponse(response) {
    // debug(response.statusCode);
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      let message;
      if (response.body.errors && response.body.errors.length > 0) {
        message = response.body.errors[0];
      } else {
        message = `Status ${response.statusCode}`;
      }
      const error = new Error(message);
      error.response = response;
      return Promise.reject(error);
    }
    return Promise.resolve(response.body);
  }

  client.handleVaultResponse = handleVaultResponse;

  // defaults
  client.apiVersion = config.apiVersion || 'v1';
  client.endpoint = config.endpoint || process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
  client.token = config.token || process.env.VAULT_TOKEN;

  const requestSchema = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
      },
      method: {
        type: 'string',
      },
    },
    required: ['path', 'method'],
  };

  // Handle any HTTP requests
  client.request = (options = {}) => {
    const valid = tv4.validate(options, requestSchema);
    if (!valid) return Promise.reject(tv4.error);

    let uri = `${client.endpoint}/${client.apiVersion}${options.path}`;

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

  client.help = (path, requestOptions) => {
    debug(`help for ${path}`);
    const options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = `/${path}?help=1`;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.write = (path, data, requestOptions) => {
    debug('write %o to %s', data, path);
    const options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = `/${path}`;
    options.json = data;
    options.method = 'PUT';
    return client.request(options).then(handleVaultResponse);
  };

  client.read = (path, requestOptions) => {
    debug(`read ${path}`);
    const options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = `/${path}`;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.list = (path, requestOptions) => {
    debug(`list ${path}`);
    const options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = `/${path}`;
    options.method = 'LIST';
    return client.request(options).then(handleVaultResponse);
  };

  client.delete = (path, requestOptions) => {
    debug(`delete ${path}`);
    const options = Object.assign({}, config.requestOptions, requestOptions);
    options.path = `/${path}`;
    options.method = 'DELETE';
    return client.request(options).then(handleVaultResponse);
  };

  function generateFunction(name, conf) {
    client[name] = (args = {}) => {
      const options = Object.assign({}, config.requestOptions, args.requestOptions);
      options.method = conf.method;
      options.path = conf.path;
      options.json = args;

      // Validate via json schema.
      if (conf.schema !== undefined) {
        let valid = true;
        if (conf.schema.query !== undefined) {
          valid = tv4.validate(options.json, conf.schema.query);
          if (valid) {
            const params = [];
            for (const key of Object.keys(conf.schema.query.properties)) {
              if (key in options.json) {
                params.push(`${key}=${encodeURIComponent(options.json[key])}`);
              }
            }
            if (params.length > 0) {
              options.path += `?${params.join('&')}`;
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
  const assignFunctions = commandName => generateFunction(commandName, commands[commandName]);
  Object.keys(commands).forEach(assignFunctions);

  return client;
};
