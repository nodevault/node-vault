sinon = require 'sinon'

describe 'node-vault', ->

  beforeEach ->
    # stub requests
    @jar =
      setCookie: sinon.stub()
    @request = sinon.stub()
    @res = sinon.stub()
    @res.statusCode = 200
    @body ={}
    @request.callsArgWith 1, null, @res, @body
    @request.jar = sinon.stub().returns @jar
    @request.cookie = sinon.stub()

    @vault = require("#{__dirname}/../index")
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


  describe 'module', ->
    it 'should export a function that returns a new client', ->
      fn = require("#{__dirname}/../index")
      v = fn()
      fn.should.be.a.Function
      v.should.be.an.Object


  describe 'client', ->

    describe 'help(path, done)', ->
      it 'should response help text for any path', (done)->
        path = 'sys/policy'
        params =
          method: 'GET'
          uri: @getURI(path)+'?help=1'
        @vault.help path, @assertRequest(@request, params, done)

    describe 'write(path, data, done)', ->
      it 'should write data to path', (done)->
        path = 'secret/hello'
        data = value: 'world'
        params =
          method: 'PUT'
          uri: @getURI(path)
        @vault.write path, data, @assertRequest(@request, params, done)

    describe 'read(path, done)', ->
      it 'should read data from path', (done)->
        path = 'secret/hello'
        params =
          method: 'GET'
          uri: @getURI(path)
        @vault.read path, @assertRequest(@request, params, done)

    describe 'delete(path, done)', ->
      it 'should delete data from path', (done)->
        path = 'secret/hello'
        params =
          method: 'DELETE'
          uri: @getURI(path)
        @vault.delete path, @assertRequest(@request, params, done)
