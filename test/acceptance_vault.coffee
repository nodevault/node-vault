
describe 'node-vault', ->

  describe 'acceptance testing', ->

    before (done)->
      Vault = require("#{__dirname}/../index")
      vault = Vault.createClient()
      vault.init { secret_shares: 1, secret_threshold: 1 }, (err, result)=>
        done err if err
        { keys, root_token } = result
        vault.token = @token = root_token
        vault.unseal { secret_shares: 1, key: keys[0] }, (err, result)->
          done err

    beforeEach ->
      @vault = require("#{__dirname}/../index")
        token: @token


    describe 'help(path, done)', ->

      it 'should response help text for any path', (done)->
        path = 'sys/policy'
        @vault.help path, (err, result)->
          result.should.have.property 'help'
          done err


    describe 'write(path, data, done)', ->
      it 'should write data to path', (done)->
        path = 'secret/hello'
        data = value: 'world'
        @vault.write path, data, (err, result)->
          done err


    describe 'read(path, done)', ->

      before (done)->
        @path = 'secret/hello'
        @data = value: 'world'
        @vault.write @path, @data, done

      it 'should read data from path', (done)->
        @vault.read @path, (err, result)=>
          result.data.should.have.property 'value', @data.value
          done err


    describe 'delete(path, done)', ->

      before (done)->
        @path = 'secret/hello'
        @data = value: 'world'
        @vault.write @path, @data, done

      it 'should delete data from path', (done)->
        @vault.delete @path, done
