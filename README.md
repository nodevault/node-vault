node-vault
============

[![Build Status](https://img.shields.io/travis/kr1sp1n/node-vault.svg?style=flat-square)](https://travis-ci.org/kr1sp1n/node-vault)
[![Coverage Status](https://img.shields.io/coveralls/kr1sp1n/node-vault.svg?style=flat-square)](https://coveralls.io/r/kr1sp1n/node-vault)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/david/kr1sp1n/node-vault.svg?style=flat-square)](https://david-dm.org/kr1sp1n/node-vault)

This is the first draft of a client for the HTTP API
of HashiCorp's Vault.


Install
-------------------------------

    npm install node-vault


Usage
-------------------------------

### Init and unseal

```coffeescript
vault = require("node-vault")()

vault.init { secret_shares: 1, secret_threshold: 1 }, (err, result)->
  # in the result object you can find the keys and the root_token
  { keys, root_token } = result
  vault.token = root_token # set token for any further requests to the server
  vault.unseal { secret_shares: 1, key: keys[0] }, (err, result)->
```

### Write, read and delete secrets

```coffeescript
vault.write 'secret/hello', { value: 'world', lease: '1s' }, (err, result)->
  vault.read 'secret/hello', (err, result)->
    vault.delete 'secret/hello', (err, result)->
```

Please have a look at the [example][examples] dir for a list of implemented features.



[examples]: https://github.com/kr1sp1n/node-vault/tree/master/example
