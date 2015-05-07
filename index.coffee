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
    initialize:
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

  help: (path, done)->
    debug "help for #{path}"
    @_request 'GET', '/'+path+'?help=1', null, @_handleErrors(done)

  write: (path, data, done)->
    debug "write #{path}"
    @_request 'PUT', '/'+path, data, @_handleErrors(done)

  read: (path, done)->
    debug "read #{path}"
    @_request 'GET', '/'+path, null, @_handleErrors(done)

  delete: (path, done)->
    debug "delete #{path}"
    @_request 'DELETE', '/'+path, null, @_handleErrors(done)

  _handleErrors: (done)->
    return (err, res, body)->
      return done err if err
      return done new Error(body.errors[0]) if body?.errors?
      done null, body

  _generate: (name, opts)->
    @[name] = ->
      debug "#{name}"
      [params, done] = arguments
      if typeof params == 'function'
        done = params
        params = null
      @_request opts.method, opts.path, params, @_handleErrors(done)

  _request: (method, path, data, done)->
    debug data if data?
    j = @request.jar()
    uri = "#{@endpoint}/#{@apiVersion}#{path}"
    # for k, v of data
    #   data[k] = encodeURIComponent(v)
    uri = @mustache.render uri, data # replace variables in uri
    uri = uri.replace(/&#x2F;/g, '/') # replace unicode encodings
    debug "#{method} #{uri}"
    cookie = @request.cookie "token=#{@token}"
    j.setCookie cookie, @endpoint
    @request
      jar: j
      method: method
      json: data
      uri: uri
    , (err, res, body)->
      debug err if err
      debug "RES #{res.statusCode}"
      if body
        body = JSON.parse body if typeof body != 'object'
        debug body
      done err, res, body

module.exports = (opts)->
  return new Vault(opts)
