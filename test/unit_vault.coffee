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

  describe 'help(path, done)', ->
    it 'should response help text for any path', (done)->
      @vault.help 'sys/policy', (err, result)=>
        @request.should.have.calledOnce
        done err

  describe 'status(done)', ->
    it 'should response the status of the server', (done)->
      @vault.status (err, result)=>
        @request.should.have.calledOnce
        done err

  describe 'initialized(done)', ->
    it 'should response if the server is initialized', (done)->
      @vault.initialized (err, result)=>
        @request.should.have.calledOnce
        done err

  describe 'init(params, done)', ->
    it 'should initialize the server', (done)->
      @vault.init (err, result)=>
        @request.should.have.calledOnce
        done err

  describe 'unseal(params, done)', ->
    it 'should unseal the vault', (done)->
      @vault.unseal (err, result)=>
        @request.should.have.calledOnce
        done err

  describe 'seal(params, done)', ->
    it 'should seal the vault', (done)->
      @vault.seal null, (err, result)=>
        @request.should.have.calledOnce
        done err
