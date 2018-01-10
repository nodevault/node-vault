const debug = require('debug')('node-vault')
// tv4 is a tool to validate json structures
const tv4 = require('tv4')
const request = require('request-promise-native')

// ----------------
// import features and methods definitions

const FEATURES = require('./interface/features')
const RESOURCE_METHODS = require('./interface/resource-methods')

// ----------------
// request validation schema

const REQUEST_SCHEMA = {
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
}

/**
 * Vault client class (not exported by the module, see
 * explanation at the end of this file - src/main.js)
 *
 * @param {object} [options={}] Options for the vault client
 * @param {string} [options.apiVersion='v1'] Vault's API version
 * @param {string} [options.endpoint='http://127.0.0.1:8200'] Vault endpoint address
 * @param {token} [options.token='<process.env.VAULT_TOKEN>'] Vault authentication token
 * @param {object} [options.features='<default features>'] JSON definition of the features
 * @param {object} [options.resourceMethods='<default resource methods>'] JSON definition of the resource methods
 * @param {object} [options.requestOptions={}] Request options
 * @param {object} [options._test={}] Testing options (only for unit testing, DON'T USE IT IN PRODUCTION!)
 */
class VaultClient {
  constructor (options = {}) {
    // optionally overwrite features
    // TODO: maybe a better behavior is to only extend the
    // default features and resource methods instead of
    // replacing them entirely, and move this overwriting
    // option to the _test namespace if needed
    this._features = options.features || FEATURES
    this._resourceMethods = options.resourceMethods || RESOURCE_METHODS

    // save client options
    this._options = {
      apiVersion: options.apiVersion || 'v1',
      endpoint: options.endpoint || process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
      token: options.token || process.env.VAULT_TOKEN,
      requestOptions: {},
      insecure: (options._test && options._test.insecure) || false
    }

    // request testing stub injection
    this.request = ((options._test && options._test['request-promise']) || request).defaults({
      json: true,
      resolveWithFullResponse: true,
      simple: false,
      strictSSL: !process.env.VAULT_SKIP_VERIFY
    })

    // create client and save it
    this.client = this._createClient()
  }

  // ----------------
  // data

  _getOption (option) {
    return this._options[option]
  }

  _validate (json, schema) {
    // ignore validation if no schema
    if (!schema) return
    const valid = tv4.validate(json, schema)
    if (!valid) {
      debug(tv4.error.dataPath)
      debug(tv4.error.message)
      throw tv4.error
    }
  }

  // ----------------
  // method generators

  _generateFeature (data) {
    return async (args = {}) => {
      // merge all request options
      const requestOptions = Object.assign({},
        this._getOption('requestOptions'),
        args.requestOptions)

      // generate request options
      requestOptions.method = data.method
      requestOptions.path = data.path
      delete args.requestOptions
      requestOptions.json = args

      // no schema object -> no validation
      if (!data.schema) return this._request(requestOptions)
      // else do validation of request URL and body
      this._validate(requestOptions.json, data.schema.req)
      this._validate(requestOptions.json, data.schema.query)

      // extend the options and execute request
      const extendedOptions = this._extendRequestOptions(data, requestOptions)
      return this._request(extendedOptions)
    }
  }

  _generateResourceMethod (operation, query = '') {
    return (...args) => {
      // by using ...args we get an array of arguments
      // similar to the arguments object in non-arrow functions

      // the arguments for a resource method are:
      // client.<resource method>(path, [data], requestOptions)

      // the data argument is not exactly optional, it will not exist
      // for all methods except the ones using 'PUT', where it will
      // have a fixed second spot (and requestOptions becomes third)
      const path = args[0]

      // merge all request options
      const requestOptions = Object.assign({},
        this._getOption('requestOptions'),
        operation === 'PUT' ? args[2] : args[1])

      // generate request options
      requestOptions.path = `/${path}${query}`
      requestOptions.method = operation
      if (operation === 'PUT') requestOptions.json = args[1]

      // execute request
      return this._request(requestOptions)
    }
  }

  // ----------------
  // requests

  _extendRequestOptions (original, options) {
    const schema = original.schema.query
    // no schema for the query -> no need to extend
    if (!schema) return options
    // create params array
    const params = []
    // loop ONLY through schema params
    for (const key of Object.keys(schema.properties)) {
      // if and only if the property exists in the new
      // params, add it to the extended params array
      key in options.json &&
        params.push(`${key}=${encodeURIComponent(options.json[key])}`)
    }
    // this way, only whitelisted params (on the schema)
    // will be allowed in the request

    // add params (if any) to path as URL query
    if (params.length) options.path += `?${params.join('&')}`
    return options
  }

  _formatRequest (uriTemplate, values = {}) {
    return uriTemplate.replace(/{{([\S]+?)}}/g, (a, b, c) => {
      const parts = b.split('=')
      const prop = parts[0]
      const defaultValue = parts[1] || ''
      return values[prop] || defaultValue
    })
  }

  async _request (options = {}) {
    // validate
    if (!tv4.validate(options, REQUEST_SCHEMA)) throw tv4.error
    // create URI template
    const uriTemplate = `${this._getOption('endpoint')}/${this._getOption('apiVersion')}${options.path}`
    // replace variables in uri
    const uri = this._formatRequest(uriTemplate, options.json)
      // replace unicode encodings
      .replace(/&#x2F;/g, '/')
    // add URI
    options.uri = uri
    // add headers
    options.headers = options.headers || {}
    // add token
    const token = this._getOption('token')
    typeof token === 'string' && token.length &&
      (options.headers['X-Vault-Token'] = token)

    // execute request
    debug(options.method, uri)
    const response = await this.request(options)
    // handle response from vault
    return this._handleVaultResponse(response)
  }

  async _handleVaultResponse (response) {
    // throw exception is there's no response argument
    if (!response) throw new Error('[node-vault:handleVaultResponse] No response parameter')

    // if response status code is not 200 or 204 (ok responses)
    debug(response.statusCode)
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      // healthcheck response is never handled as an error
      if (response.request.path.match(/sys\/health/) !== null) return response.body

      // get the error message
      let message
      if (response.body && response.body.errors && response.body.errors.length) {
        message = response.body.errors[0]
      } else {
        message = `Status ${response.statusCode}`
      }

      // throw an exception with the message
      throw new Error(message)
    }

    // else return the response body
    return response.body
  }

  // ----------------
  // authentication

  _setToken (token) {
    if (typeof token === 'string' && token.length) this._options.token = token
    else throw new Error('[node-vault:_setToken] Incorrect token parameter')
  }

  _removeToken () {
    this.token = null
  }

  // ----------------
  // client creation

  _createClient () {
    const client = {}

    // add a feature to the current client object
    const addFeature = name =>
      (client[name] = (...args) => {
        const logMessages = [`${name}()`]
        args.length && logMessages.push('- arguments:', args)
        debug(...logMessages)
        return this._generateFeature(this._features[name])(...args)
      })

    // add a resource method to the current client object
    const addResourceMethod = (method) =>
      (client[method.name] = (...args) => {
        const logMessages = [`${method.name}()`]
        args.length && logMessages.push('- arguments:', args)
        debug(...logMessages)
        return this._generateResourceMethod(method.operation, method.query)(...args)
      })

    // add all resource methods
    this._resourceMethods.forEach(addResourceMethod)

    // add all features
    Object.keys(this._features).forEach(addFeature)

    // add login and logout (setToken and removeToken aliases)
    client.login = token => this._setToken(token)
    client.logout = () => this._removeToken()

    // add insecure properties and methods to client
    // if the insecure option is switched on (for testing)
    if (this._options.insecure) {
      client.endpoint = this._options.endpoint
      client.apiVersion = this._options.apiVersion
      client.handleVaultResponse =
        (...args) => this._handleVaultResponse(...args)
      client.generateFeature =
        (...args) => this._generateFeature(...args)
      client.request =
        (...args) => this._request(...args)
      client.formatRequest =
        (...args) => this._formatRequest(...args)
    }

    // return the generated client
    return client
  }
}

// for security and compatibility, instead of the class,
// a function that encapsulates the client will be exported,
// blocking access to any of the instance methods or properties

// this also means that the interface will be defined
// exclusively and explicitly in the src/features.js and
// src/resource-methods.js files

module.exports = options => new VaultClient(options).client
