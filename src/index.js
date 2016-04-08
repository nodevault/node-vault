module.exports = function (config) {
  var config = config || {};
  const debug = config.debug || require('debug')('node-vault');
  const tv4 = config.tv4 || require('tv4');
  const commands = config.commands || require('./commands.js');
  const mustache = config.mustache || require('mustache');
  const rp = config['request-promise'] || require('request-promise');
  const Promise = config.Promise || require('bluebird');

  const handleVaultError = function (response) {
    // console.log(response.statusCode);
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      return Promise.reject(new Error(response.body.errors[0]));
    } else {
      return response.body;
    }
  };

  const client = {};

  // defaults
  client.apiVersion = config.apiVersion || 'v1';
  client.endpoint = config.endpoint || process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
  client.token = config.token || process.env.VAULT_TOKEN;

  // Handle any HTTP requests.
  client.request = function (options) {
    var uri = `${client.endpoint}/${client.apiVersion}${options.path}`;

    // Replace variables in uri.
    uri = mustache.render(uri, options.json);

    // Replace unicode encodings.
    uri = uri.replace(/&#x2F;/g, '/');
    debug(`${options.method} ${uri}`);

    options.headers = options.headers || {};
    if (client.token !== undefined || client.token !== null || client.token !== '') {
      options.headers['X-Vault-Token'] = client.token;
    }

    options.uri = uri;
    options.json = options.json || true;
    options.simple = options.simple || false;
    options.resolveWithFullResponse = options.resolveWithFullResponse || true;

    debug(options);
    return rp(options);
  };

  // .then, (err, res, body)->
  //   if err
  //     debug err
  //     return done err
  //   debug "RES #{res?.statusCode}"
  //   if body
  //     # Try to parse body if it's not an object.
  //     body = JSON.parse body if typeof body != 'object'
  //     debug body
  //   done err, res, body

  client.help = function (path, options) {
    debug(`help for ${path}`);
    options = options || {};
    options.path = `/${path}?help=1`;
    options.method = 'GET';
    return client.request(options).then(handleVaultError);
  };

  const generateFunctions = function (name, config) {
    client[name] = function (args) {
      args = args || {};
      const options = args.requestOptions || {};
      options.method = config.method;
      options.path = config.path;
      options.json = args;

      // Validate via json schema.
      if (config.schema !== undefined) {
        valid = tv4.validate(options.json, config.schema.req);
        if (!valid) {
          debug(tv4.error.dataPath);
          debug(tv4.error.message);
          return Promise.reject(tv4.error);
        }
      }

      return client.request(options).then(handleVaultError);
    };
  };

  for (name in commands) {
    generateFunctions(name, commands[name]);
  }

  return client;

};

  //
  //
  //
  //
  // write: (path, data, opts = {}, done)->
  //   debug "write #{path}"
  //   [opts, done] = @_handleCallback opts, done
  //   opts.path = '/' + path
  //   opts.json = data
  //   opts.method = 'PUT'
  //   @_request opts, @_handleErrors(done)
  //
  // read: (path, opts = {}, done)->
  //   debug "read #{path}"
  //   [opts, done] = @_handleCallback opts, done
  //   opts.path = '/' + path
  //   opts.json = null
  //   opts.method = 'GET'
  //   @_request opts, @_handleErrors(done)
  //
  // delete: (path, opts = {}, done)->
  //   debug "delete #{path}"
  //   [opts, done] = @_handleCallback opts, done
  //   opts.path = '/' + path
  //   opts.json = null
  //   opts.method = 'DELETE'
  //   @_request opts, @_handleErrors(done)
  //
  // # Backwards compatibility for version 0.3.x
  // _handleCallback: (opts, done)->
  //   if typeof opts is 'function'
  //     done = opts
  //     opts = {}
  //   else
  //     json = opts
  //     opts = {}
  //     opts.json = json
  //   return [opts, done]
  //
  //
  //
  // # Generate functions defined in [routes.coffee](routes.html).
