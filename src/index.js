module.exports = function (config) {
  var config = config || {};
  const debug = config.debug || require('debug')('node-vault');
  const tv4 = config.tv4 || require('tv4');
  const commands = config.commands || require('./commands.js');
  const mustache = config.mustache || require('mustache');
  const rp = config['request-promise'] || require('request-promise');
  const Promise = config.Promise || require('bluebird');

  const client = {};

  const handleVaultResponse = function (response) {
    // debug(response.statusCode);
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      return Promise.reject(new Error(response.body.errors[0]));
    } else {
      return Promise.resolve(response.body);
    }
  };

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
  client.request = function (options) {
    options = options || {};
    valid = tv4.validate(options, requestSchema);
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

  client.help = function (path, options) {
    debug('help for ' + path);
    options = options || {};
    options.path = '/' + path + '?help=1';
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.write = function (path, data, options) {
    debug('write %o to %s', data, path);
    options = options || {};
    options.path = '/' + path;
    options.json = data;
    options.method = 'PUT';
    return client.request(options).then(handleVaultResponse);
  };

  client.read = function (path, options) {
    debug('read %s', path);
    options = options || {};
    options.path = '/' + path;

    // options.json = null;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.delete = function (path, options) {
    debug('delete ' + path);
    options = options || {};
    options.path = '/' + path;
    options.method = 'DELETE';
    return client.request(options).then(handleVaultResponse);
  };

  const generateFunction = function (name, config) {
    client[name] = function (args) {
      args = args || {};
      const options = args.requestOptions || {};
      options.method = config.method;
      options.path = config.path;
      options.json = args;

      // Validate via json schema.
      if (config.schema !== undefined && config.schema.req !== undefined) {
        valid = tv4.validate(options.json, config.schema.req);
        if (!valid) {
          debug(tv4.error.dataPath);
          debug(tv4.error.message);
          return Promise.reject(tv4.error);
        }
      }

      return client.request(options).then(handleVaultResponse);
    };
  };

  client.generateFunction = generateFunction;

  for (name in commands) {
    generateFunction(name, commands[name]);
  }

  return client;

};
