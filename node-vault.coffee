# file: index.coffee

debug = require('debug')('vault')

class Vault

  commands =
    status:
      method: 'GET'
      path: '/sys/seal-status'
    initialized:
      method: 'GET'
      path: '/sys/init'
    init:
      method: 'PUT'
      path: '/sys/init'
    unseal:
      method: 'PUT'
      path: '/sys/unseal'
    seal:
      method: 'PUT'
      path: '/sys/seal'
    mounts:
      method: 'GET'
      path: '/sys/mounts'
    mount:
      method: 'POST'
      path: '/sys/mounts/{{mount_point}}'
    unmount:
      method: 'DELETE'
      path: '/sys/mounts/{{mount_point}}'
    remount:
      method: 'POST'
      path: '/sys/remount'
    policies:
      method: 'GET'
      path: '/sys/policy'
    addPolicy:
      method: 'PUT'
      path: '/sys/policy/{{name}}'
    removePolicy:
      method: 'DELETE'
      path: '/sys/policy/{{name}}'
    auths:
      method: 'GET'
      path: '/sys/auth'
    enableAuth:
      method: 'POST'
      path: '/sys/auth/{{mount_point}}'
    disableAuth:
      method: 'DELETE'
      path: '/sys/auth/{{mount_point}}'
    audits:
      method: 'GET'
      path: '/sys/audit'
    enableAudit:
      method: 'PUT'
      path: '/sys/audit/{{name}}'
    disableAudit:
      method: 'DELETE'
      path: '/sys/audit/{{name}}'
    renew:
      method: 'PUT'
      path: '/sys/renew/{{lease_id}}'
    revoke:
      method: 'PUT'
      path: '/sys/revoke/{{lease_id}}'
    revokePrefix:
      method: 'PUT'
      path: '/sys/revoke-prefix/{{path_prefix}}'


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

  # backwards compatibility for version 0.3.x
  _handleCallback: (opts, done)->
    if typeof opts is 'function'
      done = opts
      opts = {}
    return [opts, done]

  _handleErrors: (done)->
    extend = exports.extend = (object, properties) ->
      for key, val of properties
        object[key] = val
      object
    return (err, res, body)->
      debug err if err
      return done err if err
      err = new Error(body.errors[0]) if body?.errors?
      if err
        if res.statusCode
          extend err, statusCode: res.statusCode
          extend err, statusMessage: res.statusMessage
      return done err if err
      done null, body

  _generate: (name, config)->
    @[name] = ->
      debug "#{name}"
      [opts, done] = arguments
      [opts, done] = @_handleCallback opts, done
      opts.method = config.method
      opts.path = config.path
      @_request opts, @_handleErrors(done)

  _request: (opts = {}, done)->
    uri = "#{@endpoint}/#{@apiVersion}#{opts.path}"
    uri = @mustache.render uri, opts.json # replace variables in uri
    uri = uri.replace(/&#x2F;/g, '/') # replace unicode encodings
    debug "#{opts.method} #{uri}"
    opts.headers = {} if not opts['headers']
    opts.headers['X-Vault-Token'] = @token
    opts.uri = uri
    @request opts, (err, res, body)->
      if err
        debug err
        return done err
      debug "RES #{res?.statusCode}"
      if body
        body = JSON.parse body if typeof body != 'object'
        debug body
      done err, res, body

module.exports = (opts)->
  return new Vault(opts)
