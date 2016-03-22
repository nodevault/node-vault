sinon = require 'sinon'

describe 'node-vault', ->

  describe 'module', ->
    it 'should export a function that returns a new client', ->
      fn = require("#{__dirname}/../lib/node-vault")
      v = fn()
      fn.should.be.a.Function
      v.should.be.an.Object

  describe 'client', ->

    describe 'unit testing', ->

      beforeEach ->
        # stub requests
        @request = sinon.stub()
        @res = sinon.stub()
        @res.statusCode = 200
        @body ={}
        @request.callsArgWith 1, null, @res, @body

        @vault = require("#{__dirname}/../lib/node-vault")
          request: @request

        # helper
        @getURI = (path)=>
          "#{@vault.endpoint}/#{@vault.apiVersion}/#{path}"

        @assertRequest = (request, params, done)->
          return (err, result)->
            return done err if err
            request.should.have.calledOnce
            request.calledWithMatch(params).should.be.ok
            done null

      describe 'help(path, opts, done)', ->
        it 'should response help text for any path', (done)->
          path = 'sys/policy'
          params =
            method: 'GET'
            uri: @getURI(path)+'?help=1'
          @vault.help path, @assertRequest(@request, params, done)

        it 'should handle undefined opts', (done)->
          path = 'sys/policy'
          params =
            method: 'GET'
            uri: @getURI(path)+'?help=1'
          @vault.help path, null, @assertRequest(@request, params, done)

      describe 'write(path, data, opts, done)', ->
        it 'should write data to path', (done)->
          path = 'secret/hello'
          data = value: 'world'
          params =
            method: 'PUT'
            uri: @getURI(path)
          @vault.write path, data, @assertRequest(@request, params, done)

        it 'should handle undefined opts', (done)->
          path = 'secret/hello'
          data = value: 'world'
          params =
            method: 'PUT'
            uri: @getURI(path)
          @vault.write path, data, null, @assertRequest(@request, params, done)

      describe 'read(path, opts, done)', ->
        it 'should read data from path', (done)->
          path = 'secret/hello'
          params =
            method: 'GET'
            uri: @getURI(path)
          @vault.read path, @assertRequest(@request, params, done)

        it 'should handle undefined opts', (done)->
          path = 'secret/hello'
          params =
            method: 'GET'
            uri: @getURI(path)
          @vault.read path, null, @assertRequest(@request, params, done)

      describe 'delete(path, opts, done)', ->
        it 'should delete data from path', (done)->
          path = 'secret/hello'
          params =
            method: 'DELETE'
            uri: @getURI(path)
          @vault.delete path, @assertRequest(@request, params, done)

        it 'should handle undefined opts', (done)->
          path = 'secret/hello'
          params =
            method: 'DELETE'
            uri: @getURI(path)
          @vault.delete path, null, @assertRequest(@request, params, done)


      describe '_handleErrors(done)', ->

        it 'should return a function that handles errors from vault server', ->
          cb = sinon.spy()
          fn = @vault._handleErrors()
          fn.should.be.a.Function

        it 'should callback if err', ->
          cb = sinon.spy()
          fn = @vault._handleErrors(cb)
          err = new Error('Any error')
          fn(err)
          cb.should.have.calledOnce
          cb.calledWithMatch(err).should.be.ok

        it 'should extend err with statusCode and statusMessage from vault server', ->
          cb = sinon.spy()
          fn = @vault._handleErrors(cb)
          err = new Error('stupid error')
          res =
            statusCode: 404
            statusMessage: 'Not Found'
          body =
            errors: [ err.message ]
          fn(null, res, body)
          cb.should.have.calledOnce
          err.statusCode = res.statusCode
          err.statusMessage = res.statusMessage
          cb.calledWithMatch(err).should.be.ok


      describe '_generate(name, config)', ->

        it 'should generate funtions as defined in routes.coffee', ->
          name = 'myGeneratedFunction'
          config =
            method: 'GET'
            path: '/myroute'
          @vault._generate(name, config)
          @vault.should.have.property name

        it 'should handle routes without schema property', ->
          name = 'myGeneratedFunction'
          config =
            method: 'GET'
            path: '/myroute'
          @vault._generate(name, config)
          fn = @vault[name]
          cb = sinon.spy()
          fn(cb)
          cb.calledOnce.should.be.ok


      describe '_request(opts, done)', ->

        it 'should handle undefined opts', ->
          cb = sinon.spy()
          @vault._request(null, cb)
          cb.calledOnce.should.be.ok

        it 'should set X-Vault-Token in HTTP headers if token is set', ->
          cb = sinon.spy()
          @vault.token = '123'
          @vault._request(null, cb)
          cb.calledOnce.should.be.ok

        it 'should callback any error', ->
          error = new Error('stupid error')
          @request.callsArgWith 1, error
          cb = sinon.spy()
          @vault._request null, cb
          cb.calledOnce.should.be.ok
          cb.calledWithMatch(error).should.be.ok

        it 'should parse body if is not object', ->
          json_string = '{ "test": 1 }'
          @request.callsArgWith 1, null, @res, json_string
          cb = sinon.spy()
          @vault._request null, cb
          cb.calledOnce.should.be.ok
          cb.calledWithExactly(null, @res, JSON.parse(json_string))


      describe 'init(opts, done)', ->

        it 'should throw an error if opts is null', (done)->
          @vault.init null, (err, result)->
            err.message.should.equal 'Invalid type: null (expected object)'
            done()

        it 'should throw an error if secret_shares in opts is missing', (done)->
          @vault.init {}, (err, result)->
            err.message.should.equal 'Missing required property: secret_shares'
            done()

        it 'should throw an error if secret_threshold in opts is missing', (done)->
          @vault.init { secret_shares: 1}, (err, result)->
            err.message.should.equal 'Missing required property: secret_threshold'
            done()

        it 'should throw an error if secret_shares in opts is less than 1', (done)->
          @vault.init { secret_shares: 0, secret_threshold: 1}, (err, result)->
            err.message.should.equal 'Value 0 is less than minimum 1'
            err.dataPath.should.equal '/secret_shares'
            done()

        it 'should throw an error if secret_threshold in opts is less than 1', (done)->
          @vault.init { secret_shares: 1, secret_threshold: 0}, (err, result)->
            err.message.should.equal 'Value 0 is less than minimum 1'
            err.dataPath.should.equal '/secret_threshold'
            done()
