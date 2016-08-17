'use strict';

import debugLib from 'debug';
import tv4Lib from 'tv4';
import mustacheLib from 'mustache';
import PromiseLib from 'bluebird';
import rpLib from 'request-promise';

import commandsLib from './commands';


export default function vault(config = {}) {
  // load conditional dependencies
  const debug = config.debug || debugLib('node-vault');
  const tv4 = config.tv4 || tv4Lib;
  const commands = config.commands || commandsLib;
  const mustache = config.mustache || mustacheLib;
  const rp = config['request-promise'] || rpLib;
  const Promise = config.Promise || PromiseLib;
  const client = {};


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

  client.help = (path, options = {}) => {
    debug(`help for ${path}`);
    options.path = `/${path}?help=1`;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.write = (path, data, options = {}) => {
    debug('write %o to %s', data, path);
    options.path = `/${path}`;
    options.json = data;
    options.method = 'PUT';
    return client.request(options).then(handleVaultResponse);
  };

  client.read = (path, options = {}) => {
    debug(`read ${path}`);
    options.path = `/${path}`;

    // options.json = null;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.delete = (path, options = {}) => {
    debug(`delete ${path}`);
    options.path = `/${path}`;
    options.method = 'DELETE';
    return client.request(options).then(handleVaultResponse);
  };

  function generateFunction(name, conf) {
    client[name] = (args = {}) => {
      const options = args.requestOptions || {};
      options.method = conf.method;
      options.path = conf.path;
      options.json = args;

      // Validate via json schema.
      if (conf.schema !== undefined && conf.schema.req !== undefined) {
        const valid = tv4.validate(options.json, conf.schema.req);
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
}
