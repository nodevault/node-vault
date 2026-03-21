'use strict';

const originalDebug = require('debug')('node-vault');
const originalTv4 = require('tv4');
const originalCommands = require('./commands.js');
const originalMustache = require('mustache');
const axios = require('axios');
const https = require('https');
const EventEmitter = require('events');

class VaultError extends Error {}

class ApiResponseError extends VaultError {
    constructor(message, response) {
        super(message);
        this.response = {
            statusCode: response.statusCode,
            body: response.body,
        };
    }
}

module.exports = (config = {}) => {
    // load conditional dependencies
    const debug = config.debug || originalDebug;
    const tv4 = config.tv4 || originalTv4;
    const commands = config.commands || originalCommands;
    const mustache = config.mustache || originalMustache;

    const rpDefaults = {
        json: true,
        resolveWithFullResponse: true,
        simple: false,
        strictSSL: !process.env.VAULT_SKIP_VERIFY,
    };

    if (config.rpDefaults) {
        Object.keys(config.rpDefaults).forEach((key) => {
            rpDefaults[key] = config.rpDefaults[key];
        });
    }

    const rp = (() => {
        if (config['request-promise'])
            return config['request-promise'].defaults(rpDefaults);

        const baseAgentOptions = {};
        if (rpDefaults.strictSSL === false) {
            baseAgentOptions.rejectUnauthorized = false;
        }

        // Properties that map to https.Agent options for backward compatibility
        // with the former postman-request / request library API.
        const tlsOptionKeys = ['ca', 'cert', 'key', 'passphrase', 'pfx'];

        // Build the default agent from base options + config.requestOptions TLS
        // settings so the common case (no per-call overrides) reuses one agent.
        const configReqOpts = config.requestOptions || {};
        const defaultAgentOpts = { ...baseAgentOptions };
        let hasDefaultTls = Object.keys(baseAgentOptions).length > 0;

        tlsOptionKeys.forEach((prop) => {
            if (configReqOpts[prop] !== undefined) {
                defaultAgentOpts[prop] = configReqOpts[prop];
                hasDefaultTls = true;
            }
        });
        if (configReqOpts.agentOptions !== undefined) {
            Object.assign(defaultAgentOpts, configReqOpts.agentOptions);
            hasDefaultTls = true;
        }
        if (configReqOpts.strictSSL !== undefined) {
            defaultAgentOpts.rejectUnauthorized = configReqOpts.strictSSL !== false;
            hasDefaultTls = true;
        }

        const defaultHttpsAgent = hasDefaultTls
            ? new https.Agent(defaultAgentOpts)
            : undefined;

        const instance = axios.create({
            // Accept all HTTP status codes (equivalent to request's simple: false)
            // so that vault response handling logic can process non-2xx responses.
            validateStatus: () => true,
            ...(defaultHttpsAgent ? { httpsAgent: defaultHttpsAgent } : {}),
            ...(rpDefaults.timeout ? { timeout: rpDefaults.timeout } : {}),
        });

        // Snapshot config-level TLS references so we can detect per-call overrides.
        const configTlsSnapshot = {};
        tlsOptionKeys.forEach((prop) => {
            if (configReqOpts[prop] !== undefined) configTlsSnapshot[prop] = configReqOpts[prop];
        });
        if (configReqOpts.agentOptions !== undefined) {
            configTlsSnapshot.agentOptions = configReqOpts.agentOptions;
        }
        if (configReqOpts.strictSSL !== undefined) {
            configTlsSnapshot.strictSSL = configReqOpts.strictSSL;
        }

        return function requestWrapper(options) {
            const axiosOptions = {
                method: options.method,
                url: options.uri,
                headers: { ...options.headers },
            };

            if (options.json && typeof options.json === 'object') {
                axiosOptions.data = options.json;
            }

            // Forward axios-native options when provided directly.
            if (options.timeout !== undefined) {
                axiosOptions.timeout = options.timeout;
            }
            if (options.httpAgent !== undefined) {
                axiosOptions.httpAgent = options.httpAgent;
            }

            // Only create a per-request httpsAgent when per-call TLS options
            // differ from the config defaults already baked into the instance.
            let hasOverride = false;
            const perRequestAgentOpts = {};

            tlsOptionKeys.forEach((prop) => {
                if (options[prop] !== undefined) {
                    perRequestAgentOpts[prop] = options[prop];
                    if (options[prop] !== configTlsSnapshot[prop]) hasOverride = true;
                }
            });

            if (options.agentOptions !== undefined) {
                Object.assign(perRequestAgentOpts, options.agentOptions);
                if (options.agentOptions !== configTlsSnapshot.agentOptions) hasOverride = true;
            }

            if (options.strictSSL !== undefined) {
                perRequestAgentOpts.rejectUnauthorized = options.strictSSL !== false;
                if (options.strictSSL !== configTlsSnapshot.strictSSL) hasOverride = true;
            }

            if (hasOverride) {
                axiosOptions.httpsAgent = new https.Agent({
                    ...defaultAgentOpts,
                    ...perRequestAgentOpts,
                });
            } else if (options.httpsAgent !== undefined) {
                // Allow passing a pre-built httpsAgent directly (e.g. for proxies).
                axiosOptions.httpsAgent = options.httpsAgent;
            }

            return instance(axiosOptions).then((response) => {
                let requestPath;
                try {
                    requestPath = new URL(options.uri).pathname;
                } catch (_e) {
                    requestPath = options.uri;
                }
                return {
                    statusCode: response.status,
                    body: response.data,
                    request: {
                        path: requestPath,
                    },
                };
            });
        };
    })();
    const client = new EventEmitter();

    function handleVaultResponse(response) {
        if (!response) return Promise.reject(new VaultError('No response passed'));
        debug(response.statusCode);
        if (response.statusCode !== 200 && response.statusCode !== 204) {
            // handle health response not as error
            if (response.request.path.match(/sys\/health/) !== null) {
                return Promise.resolve(response.body);
            }
            let message;
            if (response.body && response.body.errors && response.body.errors.length > 0) {
                message = response.body.errors[0];
            } else {
                message = `Status ${response.statusCode}`;
            }
            const error = new ApiResponseError(message, response);
            return Promise.reject(error);
        }
        return Promise.resolve(response.body);
    }

    client.handleVaultResponse = handleVaultResponse;

    // defaults
    client.apiVersion = config.apiVersion || 'v1';
    client.endpoint = config.endpoint || process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
    client.pathPrefix = config.pathPrefix || process.env.VAULT_PREFIX || '';
    client.token = config.token || process.env.VAULT_TOKEN;
    client.noCustomHTTPVerbs = config.noCustomHTTPVerbs || false;
    client.namespace = config.namespace || process.env.VAULT_NAMESPACE;
    client.kubernetesPath = config.kubernetesPath || 'kubernetes';

    client.endpoint = client.endpoint.replace(/\/$/, '');

    const requestSchema = {
        type: 'object',
        properties: {
            path: {
                type: 'string',
            },
            method: {
                type: 'string',
            },
        },
        required: ['path', 'method'],
    };

    // Handle any HTTP requests
    client.request = (options = {}) => {
        const valid = tv4.validate(options, requestSchema);
        if (!valid) return Promise.reject(tv4.error);
        let uri = `${client.endpoint}/${client.apiVersion}${client.pathPrefix}${options.path}`;
        // Replace unicode encodings.
        uri = uri.replace(/&#x2F;/g, '/');
        options.headers = options.headers || {};
        if (typeof client.token === 'string' && client.token.length) {
            options.headers['X-Vault-Token'] = options.headers['X-Vault-Token'] || client.token;
        }
        if (typeof client.namespace === 'string' && client.namespace.length) {
            options.headers['X-Vault-Namespace'] = client.namespace;
        }
        options.uri = uri;
        debug(options.method, uri);
        if (options.json) debug(options.json);
        return rp(options).then(client.handleVaultResponse);
    };

    client.help = (path, requestOptions) => {
        debug(`help for ${path}`);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}?help=1`;
        options.method = 'GET';
        return client.request(options);
    };

    client.write = (path, data, requestOptions) => {
        debug('write %o to %s', data, path);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}`;
        options.json = data;
        options.method = 'POST';
        return client.request(options);
    };

    client.update = (path, data, requestOptions) => {
        debug('update %o to %s', data, path);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}`;
        options.json = data;
        options.method = 'PATCH';
        options.headers = { 'Content-Type': 'application/merge-patch+json' };
        return client.request(options);
    };

    client.read = (path, requestOptions) => {
        debug(`read ${path}`);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}`;
        options.method = 'GET';
        return client.request(options);
    };

    client.list = (path, requestOptions) => {
        debug(`list ${path}`);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}`;

        if (client.noCustomHTTPVerbs) {
            options.path = `/${path}?list=1`;
            options.method = 'GET';
        } else {
            options.path = `/${path}`;
            options.method = 'LIST';
        }
        return client.request(options);
    };

    client.delete = (path, requestOptions) => {
        debug(`delete ${path}`);
        const options = { ...config.requestOptions, ...requestOptions };
        options.path = `/${path}`;
        options.method = 'DELETE';
        return client.request(options);
    };

    function validate(json, schema) {
        // ignore validation if no schema
        if (schema === undefined) return Promise.resolve();
        const valid = tv4.validate(json, schema);
        if (!valid) {
            debug(tv4.error.dataPath);
            debug(tv4.error.message);
            return Promise.reject(tv4.error);
        }
        return Promise.resolve();
    }

    function extendOptions(conf, options, args = {}) {
        const hasArgs = Object.keys(args).length > 0;
        if (!hasArgs) return Promise.resolve(options);

        const querySchema = conf.schema.query;
        if (querySchema) {
            const params = [];
            for (const key of Object.keys(querySchema.properties)) {
                if (key in args) {
                    params.push(`${key}=${encodeURIComponent(args[key])}`);
                }
            }
            if (params.length > 0) {
                options.path += `?${params.join('&')}`;
            }
        }

        const reqSchema = conf.schema.req;
        if (reqSchema) {
            const json = {};
            for (const key of Object.keys(reqSchema.properties)) {
                if (key in args) {
                    json[key] = args[key];
                }
            }
            if (Object.keys(json).length > 0) {
                options.json = json;
            }
        }

        return Promise.resolve(options);
    }

    function generateFunction(name, conf) {
        client[name] = (args = {}) => {
            const options = { ...config.requestOptions, ...args.requestOptions };
            options.method = conf.method;
            // replace args in path.
            options.path = mustache.render(conf.path, args);
            // no schema object -> no validation
            if (!conf.schema) {
                if (options.method === 'POST' || options.method === 'PUT') {
                    options.json = args;
                }
                return client.request(options);
            }
            // else do validation of request URL and body
            let promise = validate(args, conf.schema.req)
                .then(() => validate(args, conf.schema.query))
                .then(() => extendOptions(conf, options, args))
                .then((extendedOptions) => client.request(extendedOptions));

            if (conf.tokenSource) {
                promise = promise.then((response) => {
                    const candidateToken = response.auth && response.auth.client_token;
                    if (candidateToken) {
                        client.token = candidateToken;
                    }
                    return response;
                });
            }

            return promise;
        };
    }

    client.generateFunction = generateFunction;
    client.commands = commands;

    // protecting global object properties from being added
    // enforcing the immutable rule: https://github.com/airbnb/javascript#iterators-and-generators
    // going the functional way first defining a wrapper function
    const assignFunctions = (commandName) => generateFunction(commandName, commands[commandName]);
    Object.keys(commands).forEach(assignFunctions);

    // -- Token renewal management --
    let tokenRenewalTimer = null;

    /**
     * Start automatic token renewal.
     * @param {Object} [opts={}] - Options
     * @param {number} [opts.ttl] - Initial TTL in seconds. If omitted,
     *   tokenLookupSelf is called to determine the current TTL.
     * @param {number|string} [opts.increment] - Increment to request when
     *   renewing (forwarded to tokenRenewSelf).
     * @param {number} [opts.renewFraction=0.8] - Fraction of TTL at which
     *   to renew (0 < renewFraction < 1).
     * @returns {Promise} Resolves once the first renewal is scheduled.
     *
     * Events emitted:
     *   'token:renewed'      – successful renewal, receives the response.
     *   'token:error:renew'  – renewal failed, receives the error.
     *   'token:expired'      – token is no longer renewable.
     */
    client.startTokenRenewal = (opts = {}) => {
        const renewFraction = opts.renewFraction || 0.8;
        const increment = opts.increment;

        client.stopTokenRenewal();

        function scheduleRenewal(ttl) {
            const delay = Math.max(1, Math.floor(ttl * renewFraction)) * 1000;
            tokenRenewalTimer = setTimeout(() => {
                const renewArgs = increment != null ? { increment } : {};
                client.tokenRenewSelf(renewArgs)
                    .then((result) => {
                        client.emit('token:renewed', result);
                        const newTtl = result.auth && result.auth.lease_duration;
                        const renewable = result.auth && result.auth.renewable;
                        if (newTtl > 0 && renewable !== false) {
                            scheduleRenewal(newTtl);
                        } else {
                            tokenRenewalTimer = null;
                            client.emit('token:expired');
                        }
                    })
                    .catch((err) => {
                        tokenRenewalTimer = null;
                        client.emit('token:error:renew', err);
                    });
            }, delay);
            if (tokenRenewalTimer.unref) tokenRenewalTimer.unref();
        }

        const ttl = opts.ttl;
        if (ttl != null && ttl > 0) {
            scheduleRenewal(ttl);
            return Promise.resolve();
        }

        return client.tokenLookupSelf().then((result) => {
            const currentTtl = result.data && result.data.ttl;
            if (currentTtl > 0) {
                scheduleRenewal(currentTtl);
            }
            return result;
        });
    };

    /**
     * Stop automatic token renewal.
     */
    client.stopTokenRenewal = () => {
        if (tokenRenewalTimer) {
            clearTimeout(tokenRenewalTimer);
            tokenRenewalTimer = null;
        }
    };

    // -- Lease renewal management --
    const leaseTimers = {};

    /**
     * Start automatic lease renewal.
     * @param {string} leaseId - The lease ID to renew.
     * @param {number} leaseDuration - Initial lease duration in seconds.
     * @param {Object} [opts={}] - Options
     * @param {number} [opts.increment] - Increment to request on renewal.
     * @param {number} [opts.renewFraction=0.8] - Fraction of TTL at which
     *   to renew (0 < renewFraction < 1).
     *
     * Events emitted:
     *   'lease:renewed'      – successful renewal, receives { leaseId, result }.
     *   'lease:error:renew'  – renewal failed, receives { leaseId, error }.
     *   'lease:expired'      – lease is no longer renewable, receives { leaseId }.
     */
    client.startLeaseRenewal = (leaseId, leaseDuration, opts = {}) => {
        if (!leaseId) throw new VaultError('leaseId is required');
        if (!leaseDuration || leaseDuration <= 0) throw new VaultError('leaseDuration must be positive');

        const renewFraction = opts.renewFraction || 0.8;
        const increment = opts.increment;

        client.stopLeaseRenewal(leaseId);

        function scheduleRenewal(duration) {
            const delay = Math.max(1, Math.floor(duration * renewFraction)) * 1000;
            const timer = setTimeout(() => {
                const renewArgs = { lease_id: leaseId };
                if (increment != null) renewArgs.increment = increment;
                client.renew(renewArgs)
                    .then((result) => {
                        client.emit('lease:renewed', { leaseId, result });
                        if (result.lease_duration > 0 && result.renewable !== false) {
                            scheduleRenewal(result.lease_duration);
                        } else {
                            delete leaseTimers[leaseId];
                            client.emit('lease:expired', { leaseId });
                        }
                    })
                    .catch((err) => {
                        delete leaseTimers[leaseId];
                        client.emit('lease:error:renew', { leaseId, error: err });
                    });
            }, delay);
            if (timer.unref) timer.unref();
            leaseTimers[leaseId] = timer;
        }

        scheduleRenewal(leaseDuration);
    };

    /**
     * Stop automatic renewal for a specific lease.
     * @param {string} leaseId - The lease ID to stop renewing.
     */
    client.stopLeaseRenewal = (leaseId) => {
        if (leaseTimers[leaseId]) {
            clearTimeout(leaseTimers[leaseId]);
            delete leaseTimers[leaseId];
        }
    };

    /**
     * Stop all automatic renewals (token + all leases).
     */
    client.stopAllRenewals = () => {
        client.stopTokenRenewal();
        Object.keys(leaseTimers).forEach((id) => {
            clearTimeout(leaseTimers[id]);
            delete leaseTimers[id];
        });
    };

    return client;
};
