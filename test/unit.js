'use strict';
/* eslint-disable import/no-extraneous-dependencies */

import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import dirtyChai from 'dirty-chai';

import index from './../src/index.js';

const should = chai.Should;
should();
chai.use(dirtyChai);
chai.use(sinonChai);


const error = new Error('should not be called');

describe('node-vault', () => {
  describe('module', () => {
    it('should export a function that returns a new client', () => {
      console.log(index);
      const v = index();
      index.should.be.a('function');
      v.should.be.an('object');
    });
  });

  describe('client', () => {
    let request = null;
    let response = null;
    let vault = null;

    // helper
    function getURI(path) {
      return [vault.endpoint, vault.apiVersion, path].join('/');
    }

    function assertRequest(thisRequest, params, done) {
      return () => {
        thisRequest.should.have.calledOnce();
        thisRequest.calledWithMatch(params).should.be.ok();
        return done();
      };
    }

    beforeEach(() => {
      // stub requests
      request = sinon.stub();
      response = sinon.stub();
      response.statusCode = 200;

      request.returns({
        then(fn) {
          return fn(response);
        },

        catch(fn) {
          return fn();
        },
      });

      vault = index(
        {
          endpoint: 'http://localhost:8200',
          token: '123',
          'request-promise': request, // dependency injection of stub
        }
      );
    });

    describe('help(path, options)', () => {
      it('should response help text for any path', done => {
        const path = 'sys/policy';
        const params = {
          method: 'GET',
          uri: `${getURI(path)}?help=1`,
        };
        vault.help(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });

      it('should handle undefined options', done => {
        const path = 'sys/policy';
        const params = {
          method: 'GET',
          uri: `${getURI(path)}?help=1`,
        };
        vault.help(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });
    });

    describe('write(path, data, options)', () => {
      it('should write data to path', done => {
        const path = 'secret/hello';
        const data = {
          value: 'world',
        };
        const params = {
          method: 'PUT',
          uri: getURI(path),
        };
        vault.write(path, data)
        .then(assertRequest(request, params, done))
        .catch(done);
      });

      it('should handle undefined options', done => {
        const path = 'secret/hello';
        const data = {
          value: 'world',
        };
        const params = {
          method: 'PUT',
          uri: getURI(path),
        };
        vault.write(path, data)
        .then(assertRequest(request, params, done))
        .catch(done);
      });
    });

    describe('read(path, options)', () => {
      it('should read data from path', done => {
        const path = 'secret/hello';
        const params = {
          method: 'GET',
          uri: getURI(path),
        };
        vault.read(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });

      it('should handle undefined options', done => {
        const path = 'secret/hello';
        const params = {
          method: 'GET',
          uri: getURI(path),
        };
        vault.read(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });
    });

    describe('delete(path, options)', () => {
      it('should delete data from path', done => {
        const path = 'secret/hello';
        const params = {
          method: 'DELETE',
          uri: getURI(path),
        };
        vault.delete(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });

      it('should handle undefined options', done => {
        const path = 'secret/hello';
        const params = {
          method: 'DELETE',
          uri: getURI(path),
        };
        vault.delete(path)
        .then(assertRequest(request, params, done))
        .catch(done);
      });
    });

    describe('handleVaultResponse(response)', () => {
      it('should return a function that handles errors from vault server', () => {
        const fn = vault.handleVaultResponse;
        fn.should.be.a('function');
      });

      it('should return a Promise with the body if successful', done => {
        const data = { hello: 1 };
        response.body = data;
        const promise = vault.handleVaultResponse(response);
        promise.then(body => {
          body.should.equal(data);
          return done();
        });
      });

      it('should return a Promise with the error if failed', done => {
        response.statusCode = 500;
        response.body = {
          errors: ['Something went wrong.'],
        };
        const promise = vault.handleVaultResponse(response);
        promise.catch(err => {
          err.message.should.equal(response.body.errors[0]);
          return done();
        });
      });
    });

    describe('generateFunction(name, config)', () => {
      const config = {
        method: 'GET',
        path: '/myroute',
      };

      const configWithSchema = {
        method: 'GET',
        path: '/myroute',
        schema: {
          req: {
            type: 'object',
            properties: {
              testProperty: {
                type: 'integer',
                minimum: 1,
              },
            },
            required: ['testProperty'],
          },
        },
      };

      it('should generate a function with name as defined in config', () => {
        const name = 'myGeneratedFunction';
        vault.generateFunction(name, config);
        vault.should.have.property(name);
        const fn = vault[name];
        fn.should.be.a('function');
      });

      describe('generated function', () => {
        it('should return a promise', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, config);
          const fn = vault[name];
          const promise = fn();
          request.calledOnce.should.be.ok();
          /* eslint no-unused-expressions: 0*/
          promise.should.be.promise;
          promise.then(done)
          .catch(done);
        });

        it('should handle config with schema property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithSchema);
          const fn = vault[name];
          const promise = fn({ testProperty: 3 });
          promise.then(done)
          .catch(done);
        });

        it('should handle invalid arguments via schema property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithSchema);
          const fn = vault[name];
          const promise = fn({ testProperty: 'wrong data type here' });
          promise.catch(err => {
            err.message.should.equal('Invalid type: string (expected integer)');
            return done();
          });
        });
      });
    });

    describe('request(options)', () => {
      it('should reject if options are undefined', done => {
        vault.request()
        .then(() => done(error))
        .catch(() => done());
      });

      it('should handle undefined path in options', done => {
        const promise = vault.request({
          method: 'GET',
        });
        promise.catch(err => {
          err.message.should.equal('Missing required property: path');
          return done();
        });
      });

      it('should handle undefined method in options', done => {
        const promise = vault.request({
          path: '/',
        });
        promise.catch(err => {
          err.message.should.equal('Missing required property: method');
          return done();
        });
      });

      // it('should handle undefined client token', function (done) {
      //   vault.token = undefined;
      //   const promise = vault.request({});
      //   // promise.catch(function (err) {
      //   //   err.message.should.equal('Missing required property: path');
      //   //   return done();
      //   // });
      // });
    });
  });
});

//
//
//     describe '_request(opts, done)', ->
//
//       it 'should handle undefined opts', ->
//         cb = sinon.spy()
//         @vault._request(null, cb)
//         cb.calledOnce.should.be.ok
//
//       it 'should set X-Vault-Token in HTTP headers if token is set', ->
//         cb = sinon.spy()
//         @vault.token = '123'
//         @vault._request(null, cb)
//         cb.calledOnce.should.be.ok
//
//       it 'should callback any error', ->
//         error = new Error('stupid error')
//         @request.callsArgWith 1, error
//         cb = sinon.spy()
//         @vault._request null, cb
//         cb.calledOnce.should.be.ok
//         cb.calledWithMatch(error).should.be.ok
//
//       it 'should parse body if is not object', ->
//         json_string = '{ "test": 1 }'
//         @request.callsArgWith 1, null, @res, json_string
//         cb = sinon.spy()
//         @vault._request null, cb
//         cb.calledOnce.should.be.ok
//         cb.calledWithExactly(null, @res, JSON.parse(json_string))
//
//
//     describe 'init(opts, done)', ->
//
//       it 'should throw an error if opts is null', (done)->
//         @vault.init null, (err, result)->
//           err.message.should.equal 'Invalid type: null (expected object)'
//           done()
//
//       it 'should throw an error if secret_shares in opts is missing', (done)->
//         @vault.init {}, (err, result)->
//           err.message.should.equal 'Missing required property: secret_shares'
//           done()
//
//       it 'should throw an error if secret_threshold in opts is missing', (done)->
//         @vault.init { secret_shares: 1}, (err, result)->
//           err.message.should.equal 'Missing required property: secret_threshold'
//           done()
//
//       it 'should throw an error if secret_shares in opts is less than 1', (done)->
  //         @vault.init { secret_shares: 0, secret_threshold: 1}, (err, result)->
  //           err.message.should.equal 'Value 0 is less than minimum 1'
  //           err.dataPath.should.equal '/secret_shares'
  //           done()
  //
  //       it 'should throw an error if secret_threshold in opts is less than 1', (done)->
  //         @vault.init { secret_shares: 1, secret_threshold: 0}, (err, result)->
  //           err.message.should.equal 'Value 0 is less than minimum 1'
  //           err.dataPath.should.equal '/secret_threshold'
  //           done()
