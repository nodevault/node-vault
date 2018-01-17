# node-vault

[![Build Status](https://img.shields.io/travis/kr1sp1n/node-vault/master.svg?style=flat-square)](https://travis-ci.org/kr1sp1n/node-vault)
[![Coverage Status](https://img.shields.io/codecov/c/github/kr1sp1n/node-vault/master.svg?style=flat-square)](https://codecov.io/gh/kr1sp1n/node-vault/branch/master)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/david/kr1sp1n/node-vault.svg?style=flat-square)](https://david-dm.org/kr1sp1n/node-vault)

NodeJS API client for HashiCorp's [Vault]


## Install
`node-vault` supports Node.js v6 and above.

    # yarn
    yarn add node-vault
    
    # npm
    npm install node-vault


## Usage

**[All features]**

### Init and unseal

```javascript
const options = {
  apiVersion: 'v1', // default
  endpoint: 'http://127.0.0.1:8200', // default
  // VAULT_ADDR environment variable is also available
  token: '<vault token>' // client authentication token, optional
  // VAULT_TOKEN environment variable is also available
}

// get new instance of the client
const vault = require('node-vault')(options)

const run = async () => {
  // init vault server
  const initData = await vault.init({ secret_shares: 1, secret_threshold: 1 })
  // set token for all following requests
  vault.login(initData.root_token)
  // unseal vault server
  const [key] = initData.keys
  await vault.unseal({ secret_shares: 1, key })
}

run().catch(console.error)
```

### Write, read and delete secrets

```javascript
const run = async () => {
  await vault.write('secret/hello', { value: 'world', lease: '1s' })
  await vault.read('secret/hello')
  await vault.delete('secret/hello')
}

run().catch(console.error)
```

## Code documentation
Generate [docco] docs via `yarn docs`.


## Examples and feature list
Have a look at the [examples] and the generated [feature list] to see what is implemented.

When running the examples, instead of installing all the dependencies like vault, postgres and other stuff you can
use [docker] and [docker-compose] to link and run multiple docker containers with all of its dependencies.

> Note that node v8+ is required to run the examples, due to the usage of `async/await`.

```bash
git clone git@github.com:kr1sp1n/node-vault.git
cd node-vault
docker-compose up --force-recreate vault # or use "yarn refresh-docker-vault"
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

You can also init vault and run all of the examples in one go by running `yarn examples` (which just executes [examples/all.js])

## Testing

You can run the automated tests with `yarn test`.
To run tests inside docker (making it very easy to run the integration tests) simply run:

    docker-compose up --force-recreate test

There's also this yarn alias available: `yarn docker-test`.

> Note that you will need to install and setup [docker] and [docker-compose]

This will create containers for vault, postgres and the tests themselves.



[examples]: /examples
[examples/all.js]: examples/all.js
[docker-compose.yml]: /docker-compose.yml
[Vault]: https://vaultproject.io/
[docker]: https://docs.docker.com/
[docker-compose]: https://docs.docker.com/compose/
[docco]: http://ashkenas.com/docco/
[All features]: features.md
[feature list]: features.md
