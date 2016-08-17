'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    schema: {
      res: {
        type: 'object',
        properties: {
          sealed: {
            type: 'boolean'
          },
          t: {
            type: 'number'
          },
          n: {
            type: 'number'
          },
          progress: {
            type: 'number'
          }
        },
        required: ['sealed', 't', 'n', 'progress']
      }
    }
  },
  initialized: {
    method: 'GET',
    path: '/sys/init'
  },
  init: {
    method: 'PUT',
    path: '/sys/init',
    schema: {
      req: {
        type: 'object',
        properties: {
          secret_shares: {
            type: 'integer',
            minimum: 1
          },
          secret_threshold: {
            type: 'integer',
            minimum: 1
          },
          pgp_keys: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          }
        },
        required: ['secret_shares', 'secret_threshold']
      },
      res: {
        type: 'object',
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          },
          root_token: {
            type: 'string'
          }
        },
        required: ['keys', 'root_token']
      }
    }
  },
  unseal: {
    method: 'PUT',
    path: '/sys/unseal'
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal'
  },
  mounts: {
    method: 'GET',
    path: '/sys/mounts'
  },
  mount: {
    method: 'POST',
    path: '/sys/mounts/{{mount_point}}'
  },
  unmount: {
    method: 'DELETE',
    path: '/sys/mounts/{{mount_point}}'
  },
  remount: {
    method: 'POST',
    path: '/sys/remount'
  },
  policies: {
    method: 'GET',
    path: '/sys/policy'
  },
  addPolicy: {
    method: 'PUT',
    path: '/sys/policy/{{name}}'
  },
  getPolicy: {
    method: 'GET',
    path: '/sys/policy/{{name}}'
  },
  removePolicy: {
    method: 'DELETE',
    path: '/sys/policy/{{name}}'
  },
  auths: {
    method: 'GET',
    path: '/sys/auth'
  },
  enableAuth: {
    method: 'POST',
    path: '/sys/auth/{{mount_point}}'
  },
  disableAuth: {
    method: 'DELETE',
    path: '/sys/auth/{{mount_point}}'
  },
  audits: {
    method: 'GET',
    path: '/sys/audit'
  },
  enableAudit: {
    method: 'PUT',
    path: '/sys/audit/{{name}}'
  },
  disableAudit: {
    method: 'DELETE',
    path: '/sys/audit/{{name}}'
  },
  renew: {
    method: 'PUT',
    path: '/sys/renew/{{lease_id}}'
  },
  revoke: {
    method: 'PUT',
    path: '/sys/revoke/{{lease_id}}'
  },
  revokePrefix: {
    method: 'PUT',
    path: '/sys/revoke-prefix/{{path_prefix}}'
  },
  rotate: {
    method: 'PUT',
    path: '/sys/rotate'
  },
  githubLogin: {
    method: 'POST',
    path: '/auth/github/login'
  },
  userpassLogin: {
    method: 'POST',
    path: '/auth/userpass/login/{{username}}'
  }
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = vault;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _tv = require('tv4');

var _tv2 = _interopRequireDefault(_tv);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function vault() {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // load conditional dependencies
  var debug = config.debug || (0, _debug2.default)('node-vault');
  var tv4 = config.tv4 || _tv2.default;
  var commands = config.commands || _commands2.default;
  var mustache = config.mustache || _mustache2.default;
  var rp = config['request-promise'] || _requestPromise2.default;
  var Promise = config.Promise || _bluebird2.default;
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

  client.help = function (path) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug('help for ' + path);
    options.path = '/' + path + '?help=1';
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.write = function (path, data) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    debug('write %o to %s', data, path);
    options.path = '/' + path;
    options.json = data;
    options.method = 'PUT';
    return client.request(options).then(handleVaultResponse);
  };

  client.read = function (path) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug('read ' + path);
    options.path = '/' + path;

    // options.json = null;
    options.method = 'GET';
    return client.request(options).then(handleVaultResponse);
  };

  client.delete = function (path) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug('delete ' + path);
    options.path = '/' + path;
    options.method = 'DELETE';
    return client.request(options).then(handleVaultResponse);
  };

  function generateFunction(name, conf) {
    client[name] = function () {
      var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var options = args.requestOptions || {};
      options.method = conf.method;
      options.path = conf.path;
      options.json = args;

      // Validate via json schema.
      if (conf.schema !== undefined && conf.schema.req !== undefined) {
        var valid = tv4.validate(options.json, conf.schema.req);
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
}