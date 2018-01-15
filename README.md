# node-vault

[![Build Status](https://img.shields.io/travis/kr1sp1n/node-vault/master.svg?style=flat-square)](https://travis-ci.org/kr1sp1n/node-vault)
[![Coverage Status](https://img.shields.io/codecov/c/github/kr1sp1n/node-vault/master.svg?style=flat-square)](https://codecov.io/gh/kr1sp1n/node-vault/branch/master)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/david/kr1sp1n/node-vault.svg?style=flat-square)](https://david-dm.org/kr1sp1n/node-vault)

NodeJS API client for HashiCorp's [Vault]


## Install
make sure to use node.js version >= 8

    # yarn
    yarn add node-vault
    
    # npm
    npm install node-vault


## Usage

**[All features](features.md)**

### Init and unseal

```javascript
const options = {
  apiVersion: 'v1', // default
  endpoint: 'http://127.0.0.1:8200', // default
  // VAULT_ADDR environment variable is also available
  token: '<vault token>' // client authentication token
  // VAULT_TOKEN environment variable is also available
}

// get new instance of the client
const vault = require('node-vault')(options);

// init vault server
vault.init({ secret_shares: 1, secret_threshold: 1 })
  .then((result) => {
    const keys = result.keys
    // set token for all following requests
    vault.token = result.root_token
    // unseal vault server
    return vault.unseal({ secret_shares: 1, key: keys[0] })
  })
  .catch(console.error)
```

### write, read and delete secrets

```javascript
vault.write('secret/hello', { value: 'world', lease: '1s' })
  .then(() => vault.read('secret/hello'))
  .then(() => vault.delete('secret/hello'))
  .catch(console.error)
```

## Docs
Generate [docco] docs via `yarn docs`.


## Examples
Please have a look at the [examples] and the generated [feature list] to see what is already implemented.

Instead of installing all the dependencies like vault itself, postgres and other stuff you can
use [docker] and [docker-compose] to link and run multiple docker containers with all of its dependencies.

```bash
git clone git@github.com:kr1sp1n/node-vault.git
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

## Testing

Run tests inside docker to do also nice integration testing:

    docker-compose up --force-recreate test

This will create containers for vault, postgres and running the tests inside
docker.



[examples]: /example
[docker-compose.yml]: /docker-compose.yml
[Vault]: https://vaultproject.io/
[docker-compose]: https://www.docker.com/docker-compose
[docker]: http://docs.docker.com/
[docker toolbox]: https://www.docker.com/toolbox
[docco]: http://jashkenas.github.io/docco
[feature list]: features.md
