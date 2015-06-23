node-vault
============

[![Build Status](https://img.shields.io/travis/kr1sp1n/node-vault.svg?style=flat-square)](https://travis-ci.org/kr1sp1n/node-vault)
[![Coverage Status](https://img.shields.io/coveralls/kr1sp1n/node-vault.svg?style=flat-square)](https://coveralls.io/r/kr1sp1n/node-vault)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/david/kr1sp1n/node-vault.svg?style=flat-square)](https://david-dm.org/kr1sp1n/node-vault)

A client for the HTTP API of HashiCorp's [Vault][vaultproject] written for Node.js.


Install
-------------------------------

    npm install node-vault


Usage
-------------------------------

### Init and unseal

```javascript
vault = require("node-vault")();

vault.init({ secret_shares: 1, secret_threshold: 1 }, function(err, result) {
  var keys = result.keys;
  vault.token = result.root_token;
  vault.unseal({ secret_shares: 1, key: keys[0] }, function(err, result) {
    // Done
  });
});
```

### Write, read and delete secrets

```javascript
vault.write('secret/hello', { value: 'world', lease: '1s' }, function(err, result) {
  vault.read('secret/hello', function(err, result) {
    vault.delete('secret/hello', function(err, result) {
    });
  });
});
```

Examples
-------------------------------
Please have a look at the [example][examples] dir for a list of implemented features.

```bash
git clone git@github.com:kr1sp1n/node-vault.git
cd node-vault
npm install
```

Test
-------------------------------
You can run the tests inside a docker container via docker-compose:

```bash
brew install docker-compose
docker-compose up
```

[examples]: https://github.com/kr1sp1n/node-vault/tree/master/example
[vaultproject]: https://vaultproject.io/
