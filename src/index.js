const debug = require('debug')('node-vault')
const tv4 = require('tv4')
const mustache = require('mustache')
const rp = require('request-promise-native')

// ----------------
// import features and methods definitions

const FEATURES = require('./features.js')
const RESOURCE_METHODS = require('./resource-methods.js')

// ----------------
// validation schemas

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
 * Vault client class
 *
 * @param {object} [options={}] Options for the vault client
 * @param {string} [options.apiVersion='v1'] Vault's API version
 * @param {string} [options.endpoint='http://127.0.0.1:8200'] Vault endpoint address
 * @param {token} [options.token='<process.env.VAULT_TOKEN>'] Vault authentication token
 * @param {object} [options.features='<default features>'] JSON definition of the features
 * @param {object} [options.resourceMethods='<default resource methods>'] JSON definition of the resource methods
 * @param {object} [options.requestOptions={}] Request options
 */
class VaultClient {
  constructor (options = {}) {
    // optionally overwrite features
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

    // testing stubs
    this.rp = ((options._test && options._test['request-promise']) || rp).defaults({
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
  // helpers

  _extendRequestOptions (original, options) {
    const schema = original.schema.query
    // no schema for the query -> no need to extend
    if (!schema) return options
    const params = []
    for (const key of Object.keys(schema.properties)) {
      if (key in options.json) {
        params.push(`${key}=${encodeURIComponent(options.json[key])}`)
      }
    }
    if (params.length > 0) {
      options.path += `?${params.join('&')}`
    }
    return options
  }

  _generateFeature (data) {
    return async (args = {}) => {
      const requestOptions = Object.assign({},
        this._getOption('requestOptions'),
        args.requestOptions)
      requestOptions.method = data.method
      requestOptions.path = data.path
      delete args.requestOptions
      requestOptions.json = args
      // no schema object -> no validation
      if (!data.schema) return this._request(requestOptions)
      // else do validation of request URL and body
      this._validate(requestOptions.json, data.schema.req)
      this._validate(requestOptions.json, data.schema.query)
      const extendedOptions = this._extendRequestOptions(data, requestOptions)
      return this._request(extendedOptions)
    }
  }

  _generateResourceMethod (operation, query = '') {
    return (...args) => {
      const path = args[0]

      const requestOptions = Object.assign({},
        this._getOption('requestOptions'),
        operation === 'PUT' ? args[2] : args[1])

      requestOptions.path = `/${path}${query}`
      requestOptions.method = operation
      if (operation === 'PUT') requestOptions.json = args[1]

      return this._request(requestOptions)
    }
  }

  async _request (options = {}) {
    const valid = tv4.validate(options, REQUEST_SCHEMA)
    if (!valid) return Promise.reject(tv4.error)
    let uri = `${this._getOption('endpoint')}/${this._getOption('apiVersion')}${options.path}`
    // Replace variables in uri.
    uri = mustache.render(uri, options.json)
    // Replace unicode encodings.
    uri = uri.replace(/&#x2F;/g, '/')
    options.headers = options.headers || {}
    if (this._getOption('token') !== undefined || this._getOption('token') !== null || this._getOption('token') !== '') {
      options.headers['X-Vault-Token'] = this._getOption('token')
    }
    options.uri = uri
    debug(options.method, uri)
    // debug(options.json);
    const response = await this.rp(options)
    return this._handleVaultResponse(response)
  }

  async _handleVaultResponse (response) {
    if (!response) throw new Error('[node-vault:handleVaultResponse] No response passed')
    debug(response.statusCode)
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      // healthcheck response is never handled as an error
      if (response.request.path.match(/sys\/health/) !== null) return response.body

      let message
      if (response.body && response.body.errors && response.body.errors.length) {
        message = response.body.errors[0]
      } else {
        message = `Status ${response.statusCode}`
      }
      throw new Error(message)
    }
    return response.body
  }

  // ----------------
  // client creation

  _createClient () {
    const client = {}

    const addMethod = name =>
      (client[name] = (...args) =>
        this._generateFeature(this._features[name])(...args))

    const addResourceMethod = (method) =>
      (client[method.name] = (...args) =>
        this._generateResourceMethod(method.operation, method.query)(...args))

    this._resourceMethods.forEach(addResourceMethod)
    Object.keys(this._features).forEach(addMethod)

    if (this._options.insecure) {
      client.endpoint = this._options.endpoint
      client.apiVersion = this._options.apiVersion
      client.handleVaultResponse =
        (...args) => this._handleVaultResponse(...args)
      client.generateFeature =
        (...args) => this._generateFeature(...args)
      client.request =
        (...args) => this._request(...args)
    }

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
