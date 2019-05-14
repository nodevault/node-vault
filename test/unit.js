const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const should = chai.Should;
const expect = chai.expect;

should();
chai.use(dirtyChai);
chai.use(sinonChai);

const index = require('./../src/index.js');

const error = new Error('should not be called');

describe('node-vault', () => {
  describe('module', () => {
    after(() => {
      process.env.VAULT_SKIP_VERIFY = '';
    });

    it('should export a function that returns a new client', () => {
      const v = index();
      index.should.be.a('function');
      v.should.be.an('object');
    });

    it('should set default values for request library', () => {
      const defaultsStub = sinon.stub();

      index({
        'request-promise': {
          defaults: defaultsStub,
        },
      });

      defaultsStub.should.be.calledOnce();
      defaultsStub.should.be.calledWithExactly({
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        strictSSL: true,
      });
    });

    it('should disable ssl security based on vault environment variable', () => {
      const defaultsStub = sinon.stub();

      // see https://www.vaultproject.io/docs/commands/environment.html for details
      process.env.VAULT_SKIP_VERIFY = 'catpants';

      index({
        'request-promise': {
          defaults: defaultsStub,
        },
      });

      defaultsStub.should.be.calledOnce();
      defaultsStub.should.be.calledWithExactly({
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        strictSSL: false,
      });
    });
  });


  describe('client', () => {
    let request = null;
    let response = null;
    let vault = null;
    let vaultNoCustomHTTPVerbs = null;

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

      const vaultConfig = {
        endpoint: 'http://localhost:8200',
        token: '123',
        'request-promise': {
          defaults: () => request, // dependency injection of stub
        },
      };

      vault = index(vaultConfig);
      vaultConfig.noCustomHTTPVerbs = true;
      vaultNoCustomHTTPVerbs = index(vaultConfig);
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

    describe('list(path, requestOptions)', () => {
      describe('with default options', () => {
        it('should list entries at the specific path', done => {
          const path = 'secret/hello';
          const params = {
            method: 'LIST',
            uri: getURI(path),
          };
          vault.list(path)
            .then(assertRequest(request, params, done))
            .catch(done);
        });
      });

      describe('with noCustomVerbs option', () => {
        it('should list entries at the specific path', done => {
          const path = 'secret/hello';
          const params = {
            method: 'GET',
            uri: `${getURI(path)}?list=1`,
          };
          vaultNoCustomHTTPVerbs.list(path)
            .then(assertRequest(request, params, done))
            .catch(done);
        });
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

    describe('unwrap(options)', () => {
      it('should return original response', done => {
        const path = 'sys/wrapping/unwrap';
        const params = {
          method: 'POST',
          uri: getURI(path),
        };
        vault.unwrap({ token: 'token' })
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
        response.request = {
          path: 'test',
        };
        const promise = vault.handleVaultResponse(response);
        promise.catch(err => {
          err.message.should.equal(response.body.errors[0]);
          err.response.statusCode.should.equal(500);
          err.response.body.should.equal(response.body);
          return done();
        });
      });

      it('should return the status code if no error in the response', done => {
        response.statusCode = 500;
        response.request = {
          path: 'test',
        };
        const promise = vault.handleVaultResponse(response);
        promise.catch(err => {
          err.message.should.equal(`Status ${response.statusCode}`);
          err.response.statusCode.should.equal(500);
          expect(err.response.body).to.be.undefined;
          return done();
        });
      });

      it('should not handle response from health route as error', done => {
        const data = {
          initialized: true,
          sealed: true,
          standby: true,
          server_time_utc: 1474301338,
          version: 'Vault v0.6.1',
        };
        response.statusCode = 503;
        response.body = data;
        response.request = {
          path: '/v1/sys/health',
        };
        const promise = vault.handleVaultResponse(response);
        promise.then(body => {
          body.should.equal(data);
          return done();
        });
      });

      it('should return error if error on request path with health and not sys/health', done => {
        response.statusCode = 404;
        response.body = {
          errors: [],
        };
        response.request = {
          path: '/v1/sys/policies/applications/im-not-sys-health/app',
        };
        vault.handleVaultResponse(response)
        .then(() => done(error))
        .catch(err => {
          err.message.should.equal(`Status ${response.statusCode}`);
          return done();
        });
      });

      it('should return a Promise with the error if no response is passed', done => {
        const promise = vault.handleVaultResponse();
        promise.catch((err) => {
          err.message.should.equal('No response passed');
          return done();
        });
      });
    });

    describe('generateFunction(name, config)', () => {
      const configGet = {
        method: 'GET',
        path: '/myroute',
      };

      const configPost = {
        method: 'POST',
        path: '/myroute',
      };

      const configWithSchema = () => ({
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
      });

      const configWithQuerySchema = {
        method: 'GET',
        path: '/myroute',
        schema: {
          query: {
            type: 'object',
            properties: {
              testParam1: {
                type: 'integer',
                minimum: 1,
              },
              testParam2: {
                type: 'string',
              },
            },
            required: ['testParam1', 'testParam2'],
          },
        },
      };

      const configWithRequestSchema = {
        method: 'POST',
        path: '/myroute',
        schema: {
          req: {
            type: 'object',
            properties: {
              testParam1: {
                type: 'integer',
                minimum: 1,
              },
              testParam2: {
                type: 'string',
              },
            },
            required: ['testParam1', 'testParam2'],
          },
        },
      };

      it('should generate a function with name as defined in config', () => {
        const name = 'myGeneratedFunction';
        vault.generateFunction(name, configGet);
        vault.should.have.property(name);
        const fn = vault[name];
        fn.should.be.a('function');
      });

      describe('generated function', () => {
        it('should return a promise', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configGet);
          const fn = vault[name];
          const promise = fn();
          request.calledOnce.should.be.ok();
          /* eslint no-unused-expressions: 0*/
          promise.should.be.promise;
          promise.then(done)
          .catch(done);
        });

        it('should handle config without a schema', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configPost);
          const fn = vault[name];
          const promise = fn({ testProperty: 3 });
          const options = {
            path: '/myroute',
            json: { testProperty: 3 },
          };
          promise
            .then(() => {
              request.calledWithMatch(options).should.be.ok();
              done();
            })
            .catch(done);
        });

        it('should handle config with schema property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithSchema());
          const fn = vault[name];
          const promise = fn({ testProperty: 3 });
          promise.then(done).catch(done);
        });

        it('should handle invalid arguments via schema property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithSchema());
          const fn = vault[name];
          const promise = fn({ testProperty: 'wrong data type here' });
          promise.catch(err => {
            err.message.should.equal('Invalid type: string (expected integer)');
            return done();
          });
        });

        it('should handle schema with query property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithQuerySchema);
          const fn = vault[name];
          const promise = fn({ testParam1: 3, testParam2: 'hello' });
          const options = {
            path: '/myroute?testParam1=3&testParam2=hello',
          };
          promise
          .then(() => {
            request.calledWithMatch(options).should.be.ok();
            done();
          })
          .catch(done);
        });

        it('should handle schema with request property', done => {
          const name = 'myGeneratedFunction';
          vault.generateFunction(name, configWithRequestSchema);
          const fn = vault[name];
          const promise = fn({ testParam1: 3, testParam2: 'hello' });
          const options = {
            path: '/myroute',
            json: { testParam1: 3, testParam2: 'hello' },
          };
          promise
            .then(() => {
              request.calledWithMatch(options).should.be.ok();
              done();
            })
            .catch(done);
        });

        describe('token updates', () => {
          it('should set vault token based on configuration', done => {
            const configWithTokenSource = configWithSchema();
            configWithTokenSource.tokenSource = true;

            const A_RESPONSE_TOKEN = 'a-response-token';
            response.body = { auth: { client_token: A_RESPONSE_TOKEN } }; // k8s example

            const name = 'myGeneratedFunction';
            vault.generateFunction(name, configWithTokenSource);
            const fn = vault[name];
            const promise = fn({ testProperty: 3 });

            promise
            .then(res => {
              expect(res).to.exist();
              vault.token.should.equal(A_RESPONSE_TOKEN);
              done();
            })
            .catch(done);
          });

          it('should not set vault token if not found in response', done => {
            const configWithTokenSource = configWithSchema();
            configWithTokenSource.tokenSource = true;

            response.body = {}; // missing token

            const name = 'myGeneratedFunction';
            vault.generateFunction(name, configWithTokenSource);
            const fn = vault[name];
            const promise = fn({ testProperty: 3 });

            promise
            .then(() => {
              vault.token.should.equal('123');
              done();
            })
            .catch(done);
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
    });
  });
});
