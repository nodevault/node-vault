const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const should = chai.Should;
const { expect } = chai;

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

        it('should set additional values for request library', () => {
            const defaultsStub = sinon.stub();

            index({
                'request-promise': {
                    defaults: defaultsStub,
                },
                rpDefaults: {
                    fakeArgument: 1,
                },
            });

            defaultsStub.should.be.calledOnce();
            defaultsStub.should.be.calledWithExactly({
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                strictSSL: true,
                fakeArgument: 1,
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

    describe('client initialization', () => {
        it('should not trim endpoint if no trailing slash', () => {
            const defaultsStub = sinon.stub();
            const vaultConfig = {
                endpoint: 'http://localhost:8200',
                'request-promise': {
                    defaults: defaultsStub,
                },
            };
            const vault = index(vaultConfig);
            vault.endpoint.should.equal('http://localhost:8200');
        });

        it('should trim endpoint if trailing slash', () => {
            const defaultsStub = sinon.stub();
            const vaultConfig = {
                endpoint: 'http://localhost:8200/',
                'request-promise': {
                    defaults: defaultsStub,
                },
            };
            const vault = index(vaultConfig);
            vault.endpoint.should.equal('http://localhost:8200');
        });

        it('should not produce double slashes in request URI when endpoint has trailing slash', (done) => {
            const request = sinon.stub();
            const response = sinon.stub();
            response.statusCode = 200;
            request.returns({
                then(fn) {
                    return fn(response);
                },
                catch(fn) {
                    return fn();
                },
            });

            const vault = index({
                endpoint: 'http://localhost:8200/',
                token: '123',
                'request-promise': {
                    defaults: () => request,
                },
            });

            vault.read('secret/hello')
                .then(() => {
                    request.should.have.calledOnce();
                    const uri = request.firstCall.args[0].uri;
                    uri.should.equal('http://localhost:8200/v1/secret/hello');
                    uri.should.not.contain('//v1');
                    done();
                })
                .catch(done);
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
                namespace: 'test',
                'request-promise': {
                    defaults: () => request, // dependency injection of stub
                },
            };

            vault = index(vaultConfig);
            vaultConfig.noCustomHTTPVerbs = true;
            vaultNoCustomHTTPVerbs = index(vaultConfig);
        });

        describe('help(path, options)', () => {
            it('should response help text for any path', (done) => {
                const path = 'sys/policy';
                const params = {
                    method: 'GET',
                    uri: `${getURI(path)}?help=1`,
                };
                vault.help(path)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should handle undefined options', (done) => {
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
                it('should list entries at the specific path', (done) => {
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
                it('should list entries at the specific path', (done) => {
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
            it('should write data to path', (done) => {
                const path = 'secret/hello';
                const data = {
                    value: 'world',
                };
                const params = {
                    method: 'POST',
                    uri: getURI(path),
                };
                vault.write(path, data)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should handle undefined options', (done) => {
                const path = 'secret/hello';
                const data = {
                    value: 'world',
                };
                const params = {
                    method: 'POST',
                    uri: getURI(path),
                };
                vault.write(path, data)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });
        });

        describe('update(path, data, options)', () => {
            it('should update data to path', (done) => {
                const path = 'secret/hello';
                const data = {
                    value: 'everyone',
                };
                const params = {
                    method: 'PATCH',
                    uri: getURI(path),
                };
                vault.update(path, data)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should handle undefined options', (done) => {
                const path = 'secret/hello';
                const data = {
                    value: 'everyone',
                };
                const params = {
                    method: 'PATCH',
                    uri: getURI(path),
                };
                vault.update(path, data)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });
        });

        describe('read(path, options)', () => {
            it('should read data from path', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'GET',
                    uri: getURI(path),
                };
                vault.read(path)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should handle undefined options', (done) => {
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
            it('should delete data from path', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'DELETE',
                    uri: getURI(path),
                };
                vault.delete(path)
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should handle undefined options', (done) => {
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

        describe('config.requestOptions forwarding', () => {
            let requestWithOpts = null;
            let vaultWithOpts = null;

            const agentOpts = {
                securityOptions: 'SSL_OP_LEGACY_SERVER_CONNECT',
            };

            function getURIWithOpts(path) {
                return [vaultWithOpts.endpoint, vaultWithOpts.apiVersion, path].join('/');
            }

            function assertRequestWithOpts(thisRequest, params, done) {
                return () => {
                    thisRequest.should.have.calledOnce();
                    thisRequest.calledWithMatch(params).should.be.ok();
                    return done();
                };
            }

            beforeEach(() => {
                requestWithOpts = sinon.stub();
                const resp = sinon.stub();
                resp.statusCode = 200;

                requestWithOpts.returns({
                    then(fn) {
                        return fn(resp);
                    },
                    catch(fn) {
                        return fn();
                    },
                });

                vaultWithOpts = index({
                    endpoint: 'http://localhost:8200',
                    token: '123',
                    'request-promise': {
                        defaults: () => requestWithOpts,
                    },
                    requestOptions: {
                        agentOptions: agentOpts,
                    },
                });
            });

            it('should forward agentOptions from config.requestOptions in help()', (done) => {
                const path = 'sys/policy';
                const params = {
                    method: 'GET',
                    uri: `${getURIWithOpts(path)}?help=1`,
                    agentOptions: agentOpts,
                };
                vaultWithOpts.help(path)
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should forward agentOptions from config.requestOptions in read()', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'GET',
                    uri: getURIWithOpts(path),
                    agentOptions: agentOpts,
                };
                vaultWithOpts.read(path)
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should forward agentOptions from config.requestOptions in write()', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'POST',
                    uri: getURIWithOpts(path),
                    agentOptions: agentOpts,
                };
                vaultWithOpts.write(path, { value: 'world' })
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should forward agentOptions from config.requestOptions in delete()', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'DELETE',
                    uri: getURIWithOpts(path),
                    agentOptions: agentOpts,
                };
                vaultWithOpts.delete(path)
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should forward agentOptions from config.requestOptions in list()', (done) => {
                const path = 'secret/hello';
                const params = {
                    method: 'LIST',
                    uri: getURIWithOpts(path),
                    agentOptions: agentOpts,
                };
                vaultWithOpts.list(path)
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should forward agentOptions from config.requestOptions in generated functions', (done) => {
                const name = 'myTestFunction';
                vaultWithOpts.generateFunction(name, {
                    method: 'GET',
                    path: '/myroute',
                });
                const params = {
                    agentOptions: agentOpts,
                };
                vaultWithOpts[name]()
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });

            it('should allow per-call requestOptions to override config.requestOptions', (done) => {
                const path = 'secret/hello';
                const overrideOpts = {
                    securityOptions: 'SSL_OP_NO_SSLv3',
                };
                const params = {
                    method: 'GET',
                    uri: getURIWithOpts(path),
                    agentOptions: overrideOpts,
                };
                vaultWithOpts.read(path, { agentOptions: overrideOpts })
                    .then(assertRequestWithOpts(requestWithOpts, params, done))
                    .catch(done);
            });
        });

        describe('unwrap(options)', () => {
            it('should return original response', (done) => {
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

            it('should return a Promise with the body if successful', (done) => {
                const data = { hello: 1 };
                response.body = data;
                const promise = vault.handleVaultResponse(response);
                promise.then((body) => {
                    body.should.equal(data);
                    return done();
                });
            });

            it('should return a Promise with the error if failed', (done) => {
                response.statusCode = 500;
                response.body = {
                    errors: ['Something went wrong.'],
                };
                response.request = {
                    path: 'test',
                };
                const promise = vault.handleVaultResponse(response);
                promise.catch((err) => {
                    err.message.should.equal(response.body.errors[0]);
                    err.response.statusCode.should.equal(500);
                    err.response.body.should.equal(response.body);
                    return done();
                });
            });

            it('should return the status code if no error in the response', (done) => {
                response.statusCode = 500;
                response.request = {
                    path: 'test',
                };
                const promise = vault.handleVaultResponse(response);
                promise.catch((err) => {
                    err.message.should.equal(`Status ${response.statusCode}`);
                    err.response.statusCode.should.equal(500);
                    expect(err.response.body).to.be.undefined;
                    return done();
                });
            });

            it('should not handle response from health route as error', (done) => {
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
                promise.then((body) => {
                    body.should.equal(data);
                    return done();
                });
            });

            it('should return error if error on request path with health and not sys/health', (done) => {
                response.statusCode = 404;
                response.body = {
                    errors: [],
                };
                response.request = {
                    path: '/v1/sys/policies/applications/im-not-sys-health/app',
                };
                vault.handleVaultResponse(response)
                    .then(() => done(error))
                    .catch((err) => {
                        err.message.should.equal(`Status ${response.statusCode}`);
                        return done();
                    });
            });

            it('should return a Promise with the error if no response is passed', (done) => {
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
                it('should return a promise', (done) => {
                    const name = 'myGeneratedFunction';
                    vault.generateFunction(name, configGet);
                    const fn = vault[name];
                    const promise = fn();
                    request.calledOnce.should.be.ok();
                    /* eslint no-unused-expressions: 0 */
                    promise.should.be.promise;
                    promise.then(done)
                        .catch(done);
                });

                it('should handle config without a schema', (done) => {
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

                it('should handle config with schema property', (done) => {
                    const name = 'myGeneratedFunction';
                    vault.generateFunction(name, configWithSchema());
                    const fn = vault[name];
                    const promise = fn({ testProperty: 3 });
                    promise.then(done).catch(done);
                });

                it('should handle invalid arguments via schema property', (done) => {
                    const name = 'myGeneratedFunction';
                    vault.generateFunction(name, configWithSchema());
                    const fn = vault[name];
                    const promise = fn({ testProperty: 'wrong data type here' });
                    promise.catch((err) => {
                        err.message.should.equal('Invalid type: string (expected integer)');
                        return done();
                    });
                });

                it('should handle schema with query property', (done) => {
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

                it('should handle schema with request property', (done) => {
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
                    it('should set vault token based on configuration', (done) => {
                        const configWithTokenSource = configWithSchema();
                        configWithTokenSource.tokenSource = true;

                        const A_RESPONSE_TOKEN = 'a-response-token';
                        response.body = { auth: { client_token: A_RESPONSE_TOKEN } }; // k8s example

                        const name = 'myGeneratedFunction';
                        vault.generateFunction(name, configWithTokenSource);
                        const fn = vault[name];
                        const promise = fn({ testProperty: 3 });

                        promise
                            .then((res) => {
                                expect(res).to.exist();
                                vault.token.should.equal(A_RESPONSE_TOKEN);
                                done();
                            })
                            .catch(done);
                    });

                    it('should not set vault token if not found in response', (done) => {
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

        describe('transit commands', () => {
            it('should have rewrapData function', () => {
                vault.rewrapData.should.be.a('function');
            });

            it('should have transitCreateKey function', () => {
                vault.transitCreateKey.should.be.a('function');
            });

            it('should have transitReadKey function', () => {
                vault.transitReadKey.should.be.a('function');
            });

            it('should have transitListKeys function', () => {
                vault.transitListKeys.should.be.a('function');
            });

            it('should have transitDeleteKey function', () => {
                vault.transitDeleteKey.should.be.a('function');
            });

            it('should call rewrapData with correct path and method', (done) => {
                const params = {
                    method: 'POST',
                    path: '/transit/rewrap/mykey',
                };
                vault.rewrapData({ name: 'mykey', ciphertext: 'vault:v1:abc' })
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should call transitListKeys with correct method', (done) => {
                const params = {
                    method: 'LIST',
                    path: '/transit/keys',
                };
                vault.transitListKeys()
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should call transitReadKey with correct path', (done) => {
                const params = {
                    method: 'GET',
                    path: '/transit/keys/mykey',
                };
                vault.transitReadKey({ name: 'mykey' })
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should call transitCreateKey with correct path and method', (done) => {
                const params = {
                    method: 'POST',
                    path: '/transit/keys/mykey',
                };
                vault.transitCreateKey({ name: 'mykey', type: 'aes256-gcm96' })
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });

            it('should call transitDeleteKey with correct path and method', (done) => {
                const params = {
                    method: 'DELETE',
                    path: '/transit/keys/mykey',
                };
                vault.transitDeleteKey({ name: 'mykey' })
                    .then(assertRequest(request, params, done))
                    .catch(done);
            });
        });

        describe('commands export', () => {
            it('should expose commands object on client', () => {
                vault.commands.should.be.an('object');
            });

            it('should include encryptData in commands', () => {
                vault.commands.encryptData.should.be.an('object');
                vault.commands.encryptData.method.should.equal('POST');
                vault.commands.encryptData.path.should.equal('/transit/encrypt/{{name}}');
            });

            it('should include rewrapData in commands', () => {
                vault.commands.rewrapData.should.be.an('object');
                vault.commands.rewrapData.method.should.equal('POST');
                vault.commands.rewrapData.path.should.equal('/transit/rewrap/{{name}}');
            });
        });

        describe('request(options)', () => {
            it('should reject if options are undefined', (done) => {
                vault.request()
                    .then(() => done(error))
                    .catch(() => done());
            });

            it('should handle undefined path in options', (done) => {
                const promise = vault.request({
                    method: 'GET',
                });
                promise.catch((err) => {
                    err.message.should.equal('Missing required property: path');
                    return done();
                });
            });

            it('should handle undefined method in options', (done) => {
                const promise = vault.request({
                    path: '/',
                });
                promise.catch((err) => {
                    err.message.should.equal('Missing required property: method');
                    return done();
                });
            });
        });
    });

    describe('axios TLS options forwarding', () => {
        const https = require('https');
        const axios = require('axios');
        let axiosInstanceStub;
        let axiosCreateStub;
        let agentSpy;

        beforeEach(() => {
            // Stub axios.create to return a controllable instance stub
            axiosInstanceStub = sinon.stub().resolves({
                status: 200,
                data: {},
            });
            axiosCreateStub = sinon.stub(axios, 'create').returns(axiosInstanceStub);
            agentSpy = sinon.spy(https, 'Agent');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should create default httpsAgent with ca option from config.requestOptions', () => {
            index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    ca: 'my-custom-ca-cert',
                },
            });
            agentSpy.should.have.been.called();
            const agentArgs = agentSpy.lastCall.args[0];
            expect(agentArgs).to.have.property('ca', 'my-custom-ca-cert');
            expect(axiosCreateStub.lastCall.args[0]).to.have.property('httpsAgent');
        });

        it('should create default httpsAgent with cert and key from config.requestOptions', () => {
            index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    cert: 'client-cert',
                    key: 'client-key',
                    passphrase: 'secret',
                },
            });
            agentSpy.should.have.been.called();
            const agentArgs = agentSpy.lastCall.args[0];
            expect(agentArgs).to.have.property('cert', 'client-cert');
            expect(agentArgs).to.have.property('key', 'client-key');
            expect(agentArgs).to.have.property('passphrase', 'secret');
        });

        it('should create default httpsAgent from agentOptions in config.requestOptions', () => {
            index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    agentOptions: {
                        securityOptions: 'SSL_OP_NO_SSLv3',
                        cert: 'agent-cert',
                    },
                },
            });
            agentSpy.should.have.been.called();
            const agentArgs = agentSpy.lastCall.args[0];
            expect(agentArgs).to.have.property('securityOptions', 'SSL_OP_NO_SSLv3');
            expect(agentArgs).to.have.property('cert', 'agent-cert');
        });

        it('should allow per-call TLS options to override config.requestOptions', () => {
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    ca: 'default-ca',
                },
            });
            return vault.read('secret/hello', { ca: 'override-ca' }).then(() => {
                // Per-call override creates a new per-request agent
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.have.property('httpsAgent');
                expect(axiosCallArg.httpsAgent).to.be.an.instanceOf(https.Agent);
                // The last agent created should have the override value
                const agentArgs = agentSpy.lastCall.args[0];
                expect(agentArgs).to.have.property('ca', 'override-ca');
            });
        });

        it('should not create per-request httpsAgent when no TLS options are present', () => {
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
            });
            return vault.read('secret/hello').then(() => {
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.not.have.property('httpsAgent');
            });
        });

        it('should reuse default httpsAgent when config TLS options are unchanged', () => {
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    ca: 'my-ca',
                },
            });
            const agentCountAfterInit = agentSpy.callCount;
            return vault.read('secret/hello').then(() => {
                // No new agent should be created for request with same config options
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.not.have.property('httpsAgent');
                expect(agentSpy.callCount).to.equal(agentCountAfterInit);
            });
        });

        it('should handle strictSSL: false in requestOptions', () => {
            index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    strictSSL: false,
                },
            });
            agentSpy.should.have.been.called();
            const agentArgs = agentSpy.lastCall.args[0];
            expect(agentArgs).to.have.property('rejectUnauthorized', false);
        });

        it('should forward timeout from requestOptions to axios', () => {
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    timeout: 5000,
                },
            });
            return vault.read('secret/hello').then(() => {
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.have.property('timeout', 5000);
            });
        });

        it('should forward httpsAgent from requestOptions to axios', () => {
            const customAgent = new https.Agent({ keepAlive: true });
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    httpsAgent: customAgent,
                },
            });
            return vault.read('secret/hello').then(() => {
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.have.property('httpsAgent', customAgent);
            });
        });

        it('should forward httpAgent from requestOptions to axios', () => {
            const http = require('http');
            const customAgent = new http.Agent();
            const vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                requestOptions: {
                    httpAgent: customAgent,
                },
            });
            return vault.read('secret/hello').then(() => {
                const axiosCallArg = axiosInstanceStub.firstCall.args[0];
                expect(axiosCallArg).to.have.property('httpAgent', customAgent);
            });
        });
    });

    describe('dynamic credential management', () => {
        let request;
        let response;
        let vault;
        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
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

            vault = index({
                endpoint: 'http://localhost:8200',
                token: '123',
                'request-promise': {
                    defaults: () => request,
                },
            });
        });

        afterEach(() => {
            vault.stopAllRenewals();
            clock.restore();
        });

        describe('EventEmitter', () => {
            it('should support on/emit', (done) => {
                vault.on('test-event', (data) => {
                    data.should.equal('hello');
                    done();
                });
                vault.emit('test-event', 'hello');
            });

            it('should support once', (done) => {
                let count = 0;
                vault.once('test-event', () => {
                    count += 1;
                });
                vault.emit('test-event');
                vault.emit('test-event');
                count.should.equal(1);
                done();
            });

            it('should support removeListener', (done) => {
                let count = 0;
                const listener = () => { count += 1; };
                vault.on('test-event', listener);
                vault.removeListener('test-event', listener);
                vault.emit('test-event');
                count.should.equal(0);
                done();
            });
        });

        describe('startTokenRenewal', () => {
            it('should schedule renewal at renewFraction of TTL when ttl option is given', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100 });
                // With default renewFraction of 0.8, delay = 80 seconds
                await clock.tickAsync(79 * 1000);
                // tokenRenewSelf should not have been called yet
                request.callCount.should.equal(0);
            });

            it('should call tokenRenewSelf when the timer fires', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100 });
                await clock.tickAsync(80 * 1000); // 80% of 100
                // tokenRenewSelf should have been called
                request.calledOnce.should.be.ok();
            });

            it('should emit token:renewed on successful renewal', (done) => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.on('token:renewed', (result) => {
                    result.auth.client_token.should.equal('456');
                    done();
                });
                vault.startTokenRenewal({ ttl: 100 });
                clock.tickAsync(80 * 1000);
            });

            it('should reschedule after successful renewal', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 200, renewable: true } };
                vault.startTokenRenewal({ ttl: 100 });
                await clock.tickAsync(80 * 1000); // First renewal fires
                request.callCount.should.equal(1);
                // Next renewal at 80% of 200 = 160s
                await clock.tickAsync(160 * 1000);
                request.callCount.should.equal(2);
            });

            it('should emit token:expired when token is not renewable', (done) => {
                response.body = { auth: { client_token: '456', lease_duration: 0, renewable: false } };
                vault.on('token:expired', () => {
                    done();
                });
                vault.startTokenRenewal({ ttl: 100 });
                clock.tickAsync(80 * 1000);
            });

            it('should emit token:error:renew when renewal fails', (done) => {
                response.statusCode = 500;
                response.body = { errors: ['renewal failed'] };
                response.request = { path: '/auth/token/renew-self' };
                vault.on('token:error:renew', (err) => {
                    err.message.should.equal('renewal failed');
                    done();
                });
                vault.startTokenRenewal({ ttl: 100 });
                clock.tickAsync(80 * 1000);
            });

            it('should look up current token TTL when ttl option is not given', async () => {
                response.body = { data: { ttl: 50 } };
                await vault.startTokenRenewal();
                // tokenLookupSelf should be called
                request.calledOnce.should.be.ok();
            });

            it('should use custom renewFraction', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100, renewFraction: 0.5 });
                await clock.tickAsync(49 * 1000);
                request.callCount.should.equal(0);
                await clock.tickAsync(1 * 1000); // 50s total
                request.callCount.should.equal(1);
            });

            it('should pass increment to tokenRenewSelf', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100, increment: 3600 });
                await clock.tickAsync(80 * 1000);
                request.calledOnce.should.be.ok();
            });
        });

        describe('stopTokenRenewal', () => {
            it('should cancel the scheduled token renewal', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100 });
                vault.stopTokenRenewal();
                await clock.tickAsync(80 * 1000);
                request.callCount.should.equal(0);
            });

            it('should be safe to call when no renewal is active', () => {
                vault.stopTokenRenewal(); // should not throw
            });
        });

        describe('startLeaseRenewal', () => {
            it('should throw if leaseId is missing', () => {
                expect(() => vault.startLeaseRenewal(null, 100)).to.throw('leaseId is required');
            });

            it('should throw if leaseDuration is not positive', () => {
                expect(() => vault.startLeaseRenewal('lease-1', 0)).to.throw('leaseDuration must be positive');
            });

            it('should schedule renewal at renewFraction of lease duration', async () => {
                response.body = { lease_id: 'lease-1', lease_duration: 100, renewable: true };
                vault.startLeaseRenewal('lease-1', 100);
                await clock.tickAsync(79 * 1000);
                request.callCount.should.equal(0);
                await clock.tickAsync(1 * 1000);
                request.callCount.should.equal(1);
            });

            it('should emit lease:renewed on successful renewal', (done) => {
                response.body = { lease_id: 'lease-1', lease_duration: 100, renewable: true };
                vault.on('lease:renewed', (data) => {
                    data.leaseId.should.equal('lease-1');
                    done();
                });
                vault.startLeaseRenewal('lease-1', 100);
                clock.tickAsync(80 * 1000);
            });

            it('should emit lease:expired when lease is not renewable', (done) => {
                response.body = { lease_id: 'lease-1', lease_duration: 0, renewable: false };
                vault.on('lease:expired', (data) => {
                    data.leaseId.should.equal('lease-1');
                    done();
                });
                vault.startLeaseRenewal('lease-1', 100);
                clock.tickAsync(80 * 1000);
            });

            it('should emit lease:error:renew when renewal fails', (done) => {
                response.statusCode = 500;
                response.body = { errors: ['lease renewal failed'] };
                response.request = { path: '/sys/leases/renew' };
                vault.on('lease:error:renew', (data) => {
                    data.leaseId.should.equal('lease-1');
                    data.error.message.should.equal('lease renewal failed');
                    done();
                });
                vault.startLeaseRenewal('lease-1', 100);
                clock.tickAsync(80 * 1000);
            });

            it('should manage multiple leases independently', async () => {
                response.body = { lease_duration: 100, renewable: true };
                vault.startLeaseRenewal('lease-1', 100);
                vault.startLeaseRenewal('lease-2', 200);
                await clock.tickAsync(80 * 1000); // Only lease-1 should renew
                request.callCount.should.equal(1);
                await clock.tickAsync(80 * 1000); // lease-2 should renew at 160s
                request.callCount.should.equal(3); // lease-1 renewed again + lease-2 first renewal
            });
        });

        describe('stopLeaseRenewal', () => {
            it('should cancel renewal for a specific lease', async () => {
                response.body = { lease_duration: 100, renewable: true };
                vault.startLeaseRenewal('lease-1', 100);
                vault.stopLeaseRenewal('lease-1');
                await clock.tickAsync(80 * 1000);
                request.callCount.should.equal(0);
            });

            it('should be safe to call with unknown lease id', () => {
                vault.stopLeaseRenewal('unknown-lease'); // should not throw
            });
        });

        describe('stopAllRenewals', () => {
            it('should stop both token and lease renewals', async () => {
                response.body = { auth: { client_token: '456', lease_duration: 100, renewable: true } };
                vault.startTokenRenewal({ ttl: 100 });
                vault.startLeaseRenewal('lease-1', 100);
                vault.stopAllRenewals();
                await clock.tickAsync(80 * 1000);
                request.callCount.should.equal(0);
            });
        });
    });
});
