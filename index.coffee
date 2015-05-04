# file: index.coffee

debug = require('debug')('vault')

class Vault

  commands =
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
    getAuthBackends:
      method: 'GET'
      path: '/sys/auth'
    addAuthBackend:
      method: 'POST',
      path: '/sys/auth/{{mount_point}}'
    configureAuthBackend:
      method: 'PUT'
      path: '/auth/{{mount_point}}/config'
    getPolicies:
      method: 'GET'
      path: '/sys/policy'
    getSelfToken:
      method: 'GET'
      path: '/auth/token/lookup-self'
    createToken:
      method: 'POST'
      path: '/auth/token/create'
    mapGithubTeam:
      method: 'PUT'
      path: '/auth/{{mount_point}}/map/teams/{{team}}'


  constructor: (opts={})->
    @mustache = opts.mustache or require 'mustache'
    @request = opts.request or require 'request'
    @apiVersion = opts.apiVersion or 'v1'
    @endpoint = opts.endpoint or process.env['VAULT_ADDR']
    @token = opts.token or process.env['VAULT_TOKEN']
    @_generate k, v for k, v of commands

  _generate: (name, opts)->
    @[name] = ->
      debug "#{name}"
      [params, done] = arguments
      if typeof params == 'function'
        done = params
        params = null
      @_request opts.method, opts.path, params, (err, res, body)->
        return done err if err
        return done new Error(body.errors[0]) if body?.errors?
        done null, body

  _request: (method, path, data, done)->
    debug data if data?
    j = @request.jar()
    uri = "#{@endpoint}/#{@apiVersion}#{path}"
    # replace variables in uri
    uri = @mustache.render uri, data
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
      debug body
      done err, res, body

module.exports = Vault
