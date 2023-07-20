# node-vault

[![Build Status](https://img.shields.io/github/checks-status/nodevault/node-vault/master.svg?style=flat-square)](https://github.com/nodevault/node-vault/actions?query=branch%3Amaster)
[![Coverage Status](https://img.shields.io/codecov/c/github/nodevault/node-vault/master.svg?style=flat-square)](https://app.codecov.io/gh/nodevault/node-vault/tree/master)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![test](https://img.shields.io/npm/v/node-vault?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/node-vault.svg?style=flat-square)](https://libraries.io/npm/node-vault/)
[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/node-vault?style=flat-square)](https://opencollective.com/node-vault/contribute)

A client for the HTTP API of HashiCorp's [Vault] written for Node.js.


## Install
Prerequisites:
 - NodeJS >= `16.0.0`

```bash
npm install -S node-vault
```

> The year is 2023; If, for whatever reason, you need to use an older version of node.js (yet still `>= 6.x`), use `node-vault <= v0.10.0`
>
> Please note that `node-vault <= v0.10.0` contains multiple vulnerabilities ☠️


## Test

Run tests using docker-compose (includes vault, postgres and running the tests inside) with:
```bash
docker-compose up --force-recreate test
```

## Usage

### Init and unseal

```javascript
var options = {
  apiVersion: 'v1', // default
  endpoint: 'http://127.0.0.1:8200', // default
  token: 'MY_TOKEN' // optional client token; can be fetched after valid initialization of the server
};

// get new instance of the client
var vault = require("node-vault")(options);

// init vault server
vault.init({ secret_shares: 1, secret_threshold: 1 })
.then( (result) => {
  var keys = result.keys;
  // set token for all following requests
  vault.token = result.root_token;
  // unseal vault server
  return vault.unseal({ secret_shares: 1, key: keys[0] })
})
.catch(console.error);
```

### Write, read and delete secrets

```javascript
vault.write('secret/hello', { value: 'world', lease: '1s' })
.then( () => vault.read('secret/hello'))
.then( () => vault.delete('secret/hello'))
.catch(console.error);
```

## Docs
Just generate [docco] docs via `npm run docs`.


## Examples
Please have a look at the [examples] and the generated [feature list] to see what is already implemented.

Instead of installing all the dependencies like vault itself, postgres and other stuff you can
use [docker] and [docker-compose] to link and run multiple docker containers with all of its dependencies.

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
You should see `root_token: ` followed by a long key in the response.
Please copy that long key and export it as environment variable:
```bash
export VAULT_TOKEN=<insert long key here>
```

Now you are able to run all of the other [examples]:
```bash
node example/policies.js
```

## Connecting to vault through a bastion host

To connect to a vault server in a private network with a bastion host, you'll need to first open a connection:
```bash
ssh -D <socks4Port> bastion.example.com
```

```javascript
const SocksProxyAgent = require('socks-proxy-agent');
const agent = new SocksProxyAgent(`socks://127.0.0.1:${socks4Port}`, true);
const options = {
  apiVersion: 'v1',
  rpOptions: {
    agent,
  },
};

const vault = require('node-vault')(options);
```

[![Backers](https://opencollective.com/node-vault/tiers/backers.svg?avatarHeight=80&width=600)](https://opencollective.com/node-vault/contribute)

[examples]: https://github.com/nodevault/node-vault/tree/master/example
[docker-compose.yml]: https://github.com/nodevault/node-vault/tree/master/docker-compose.yml
[Vault]: https://vaultproject.io/
[docker-compose]: https://www.docker.com/docker-compose
[docker]: http://docs.docker.com/
[docker toolbox]: https://www.docker.com/toolbox
[docco]: http://jashkenas.github.io/docco
[feature list]: https://github.com/nodevault/node-vault/tree/master/features.md
