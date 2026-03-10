# node-vault

[![Build Status](https://img.shields.io/github/checks-status/nodevault/node-vault/master.svg?style=flat-square)](https://github.com/nodevault/node-vault/actions?query=branch%3Amaster)
[![Coverage Status](https://img.shields.io/codecov/c/github/nodevault/node-vault/master.svg?style=flat-square)](https://app.codecov.io/gh/nodevault/node-vault/tree/master)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![NPM Version](https://img.shields.io/npm/v/node-vault?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/node-vault.svg?style=flat-square)](https://libraries.io/npm/node-vault/)
[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/node-vault?style=flat-square)](https://opencollective.com/node-vault/contribute)

A client for the HTTP API of HashiCorp's [Vault] written for Node.js.


## Install

Prerequisites:
 - Node.js >= `18.0.0`

```bash
npm install -S node-vault
```

> **Note:** If you need to use an older version of Node.js (>= 6.x), use `node-vault <= v0.10.0`.
> Please be aware that `node-vault <= v0.10.0` contains multiple known vulnerabilities ☠️

TypeScript definitions are included in the package.


## Test

Run tests using docker-compose (includes vault and postgres) with:
```bash
docker-compose up --force-recreate test
```

## Configuration

### Client Options

```javascript
const vault = require('node-vault')({
  apiVersion: 'v1',                        // API version (default: 'v1')
  endpoint: 'http://127.0.0.1:8200',      // Vault server URL (default: 'http://127.0.0.1:8200')
  token: 'MY_TOKEN',                       // Vault token for authentication
  pathPrefix: '',                          // Optional prefix for all request paths
  namespace: 'my-namespace',               // Vault Enterprise namespace
  noCustomHTTPVerbs: false,                // Use GET with ?list=1 instead of LIST HTTP method
  requestOptions: {},                      // Custom axios request options applied to all requests
});
```

### Environment Variables

The client reads the following environment variables as defaults:

| Variable | Description |
| --- | --- |
| `VAULT_ADDR` | Vault server URL (overridden by `endpoint` option) |
| `VAULT_TOKEN` | Vault token (overridden by `token` option) |
| `VAULT_NAMESPACE` | Vault Enterprise namespace (overridden by `namespace` option) |
| `VAULT_PREFIX` | Request path prefix (overridden by `pathPrefix` option) |
| `VAULT_SKIP_VERIFY` | When set, disables SSL certificate verification |


## Usage

### Init and unseal

```javascript
const vault = require('node-vault')({
  apiVersion: 'v1',
  endpoint: 'http://127.0.0.1:8200',
  token: 'MY_TOKEN', // optional; can be set after initialization
});

// init vault server
vault.init({ secret_shares: 1, secret_threshold: 1 })
  .then((result) => {
    const keys = result.keys;
    // set token for all following requests
    vault.token = result.root_token;
    // unseal vault server
    return vault.unseal({ secret_shares: 1, key: keys[0] });
  })
  .catch(console.error);
```

### Write, read, update and delete secrets

```javascript
vault.write('secret/hello', { value: 'world', lease: '1s' })
  .then(() => vault.read('secret/hello'))
  .then(() => vault.delete('secret/hello'))
  .catch(console.error);
```

The `update` method sends a `PATCH` request with `application/merge-patch+json` content type:

```javascript
vault.update('secret/data/hello', { data: { value: 'new-world' } })
  .catch(console.error);
```

### List secrets

```javascript
vault.list('secret/metadata/')
  .then((result) => console.log(result.data.keys))
  .catch(console.error);
```

### Kubernetes Auth Example

```javascript
const fs = require('fs');

// Read service account token from default mount path
const jwt = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', { encoding: 'utf8' });

// If the Vault Kubernetes auth endpoint is /auth/example-cluster/login and the role is example-role
vault.kubernetesLogin({
  role: 'example-role',
  jwt: jwt,
  mount_point: 'example-cluster',
}).catch(console.error);
```

### AppRole Auth Example

```javascript
const vault = require('node-vault')();

vault.approleLogin({
  role_id: 'my-role-id',
  secret_id: 'my-secret-id',
})
  .then((result) => {
    // client token is automatically set on successful login
    console.log(result.auth.client_token);
  })
  .catch(console.error);
```

### Error Handling

The client exposes two error types accessible from the module:

- **`VaultError`** — Base error class for all vault-related errors.
- **`ApiResponseError`** — Thrown on non-200/204 responses. Contains a `response` property with `statusCode` and `body`.

```javascript
vault.read('secret/missing')
  .catch((err) => {
    console.error(err.message);       // Error message from Vault
    if (err.response) {
      console.error(err.response.statusCode); // e.g. 404
      console.error(err.response.body);       // Response body from Vault
    }
  });
```

### Custom Commands

You can register custom API commands using `generateFunction`:

```javascript
vault.generateFunction('myCustomEndpoint', {
  method: 'GET',
  path: '/my-custom/endpoint/{{id}}',
});

// Use the generated function
vault.myCustomEndpoint({ id: 'abc123' })
  .then(console.log)
  .catch(console.error);
```


## Docs
Generate [docco] docs via:
```bash
npm run docs
```


## Examples
Please have a look at the [examples] and the generated [feature list] to see all supported Vault API endpoints.

Instead of installing all the dependencies like vault itself and postgres, you can
use [docker] and [docker-compose] to link and run multiple docker containers with all of their dependencies.

```bash
git clone git@github.com:nodevault/node-vault.git
cd node-vault
docker-compose up vault
```

Now you can run the examples from another terminal window.

First of all you should initialize and unseal the vault:
```bash
node example/init.js
```
You should see `root_token:` followed by a long key in the response.
Please copy that long key and export it as an environment variable:
```bash
export VAULT_TOKEN=<insert long key here>
```

Now you are able to run all of the other [examples]:
```bash
node example/policies.js
```

## Connecting to Vault Through a Bastion Host

To connect to a vault server in a private network through a bastion host, first open a SOCKS proxy connection:
```bash
ssh -D <socksPort> bastion.example.com
```

Then configure the client with a SOCKS proxy agent:
```javascript
const { SocksProxyAgent } = require('socks-proxy-agent');
const agent = new SocksProxyAgent(`socks://127.0.0.1:${socksPort}`);

const vault = require('node-vault')({
  apiVersion: 'v1',
  requestOptions: {
    httpsAgent: agent,
    httpAgent: agent,
  },
});
```

[![Backers](https://opencollective.com/node-vault/tiers/backers.svg?avatarHeight=80&width=600)](https://opencollective.com/node-vault/contribute)

[examples]: https://github.com/nodevault/node-vault/tree/master/example
[docker-compose.yml]: https://github.com/nodevault/node-vault/tree/master/docker-compose.yml
[Vault]: https://vaultproject.io/
[docker-compose]: https://www.docker.com/docker-compose
[docker]: http://docs.docker.com/
[docco]: http://jashkenas.github.io/docco
[feature list]: https://github.com/nodevault/node-vault/tree/master/features.md
