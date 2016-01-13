debug = require('debug')('vault')
tv4 = require 'tv4'

class Vault

  # See [routes.coffee](routes.html) for a list of commands
  commands = require "#{__dirname}/routes"

  constructor: (opts={})->
    @mustache = opts.mustache or require 'mustache'
    @request = opts.request or require 'request'
    @apiVersion = opts.apiVersion or 'v1'
    @endpoint = opts.endpoint or process.env['VAULT_ADDR'] or "http://127.0.0.1:8200"
    @token = opts.token or process.env['VAULT_TOKEN']
    @_generate k, v for k, v of commands

  help: (path, opts = {}, done)->
    debug "help for #{path}"
    [opts, done] = @_handleCallback opts, done
    opts.path = '/' + path + '?help=1'
    opts.json = null
    opts.method = 'GET'
    @_request opts, @_handleErrors(done)

  write: (path, data, opts = {}, done)->
    debug "write #{path}"
    [opts, done] = @_handleCallback opts, done
    opts.path = '/' + path
    opts.json = data
    opts.method = 'PUT'
    @_request opts, @_handleErrors(done)

  read: (path, opts = {}, done)->
    debug "read #{path}"
    [opts, done] = @_handleCallback opts, done
    opts.path = '/' + path
    opts.json = null
    opts.method = 'GET'
    @_request opts, @_handleErrors(done)

  delete: (path, opts = {}, done)->
    debug "delete #{path}"
    [opts, done] = @_handleCallback opts, done
    opts.path = '/' + path
    opts.json = null
    opts.method = 'DELETE'
    @_request opts, @_handleErrors(done)

  # Backwards compatibility for version 0.3.x
  _handleCallback: (opts, done)->
    if typeof opts is 'function'
      done = opts
      opts = {}
    else
      json = opts
      opts = {}
      opts.json = json
    return [opts, done]

  _handleErrors: (done)->
    extend = exports.extend = (object, properties) ->
      for key, val of properties
        object[key] = val
      object
    return (err, res, body)->
      if err
        debug err
        return done err
      err = new Error(body.errors[0]) if body?.errors?
      if err
        if res.statusCode
          extend err, statusCode: res.statusCode
          extend err, statusMessage: res.statusMessage
      return done err if err
      done null, body

  # Generate functions defined in [routes.coffee](routes.html).
  _generate: (name, config)->
    @[name] = =>
      debug "#{name}"
      [opts, done] = arguments
      [opts, done] = @_handleCallback opts, done
      opts.method = config.method
      opts.path = config.path
      # Validate via json schema.
      if config.schema?
        valid = tv4.validate(opts.json, config.schema.req)
        if not valid
          debug tv4.error.dataPath
          debug tv4.error.message
          return done(tv4.error)
      @_request opts, @_handleErrors(done)

  # Handle any HTTP requests.
  _request: (opts = {}, done)->
    uri = "#{@endpoint}/#{@apiVersion}#{opts.path}"
    # Replace variables in uri.
    uri = @mustache.render uri, opts.json
    # Replace unicode encodings.
    uri = uri.replace(/&#x2F;/g, '/')
    debug "#{opts.method} #{uri}"
    opts.headers = {} if not opts['headers']
    opts.headers['X-Vault-Token'] = @token if @token?
    opts.uri = uri
    @request opts, (err, res, body)->
      if err
        debug err
        return done err
      debug "RES #{res?.statusCode}"
      if body
        # Try to parse body if it's not an object.
        body = JSON.parse body if typeof body != 'object'
        debug body
      done err, res, body

# Module exports a function that returns an instance of a new client.
module.exports = (opts)->
  return new Vault(opts)
