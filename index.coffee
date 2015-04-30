# file: index.coffee

debug = require('debug')('vault')

class Vault

  constructor: (opts={})->
    @request = opts.request or require 'request'
    @apiVersion = opts.apiVersion or 'v1'
    @endpoint = opts.endpoint or process.env['VAULT_ADDR']
    @token = opts.token or process.env['VAULT_TOKEN']

  _request: (method, path, data, done)->
    debug "#{method} #{path}"
    debug data if data?
    @request
      method: method
      json: data
      uri: "#{@endpoint}/#{@apiVersion}#{path}"
    , (err, res, body)->
      debug err if err
      debug body
      done err, res, body

  initialized: (done)->
    @_request 'GET', '/sys/init', null, (err, res, body)=>
      return done err if err
      return done new Error('Something was wrong') if res.statusCode != 200
      done null, body.initialized

  initialize: (opts, done)->
    @_request 'PUT', '/sys/init', opts, (err, res, body)=>
      return done err if err
      return done new Error(body.errors[0]) if body.errors?
      done null, body

module.exports = Vault
