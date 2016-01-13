node-vault
============

[![Build Status](https://img.shields.io/travis/kr1sp1n/node-vault.svg?style=flat-square)](https://travis-ci.org/kr1sp1n/node-vault)
[![Coverage Status](https://img.shields.io/coveralls/kr1sp1n/node-vault.svg?style=flat-square)](https://coveralls.io/r/kr1sp1n/node-vault)
[![Download Status](https://img.shields.io/npm/dm/node-vault.svg?style=flat-square)](https://www.npmjs.com/package/node-vault)
[![Dependency Status](https://img.shields.io/david/kr1sp1n/node-vault.svg?style=flat-square)](https://david-dm.org/kr1sp1n/node-vault)

A client for the HTTP API of HashiCorp's [Vault] written for Node.js.


Install
-------------------------------

    npm install node-vault


Usage
-------------------------------

### Init and unseal

```javascript
var options = {
  apiVersion: 'v1', // default
  endpoint: 'http://127.0.0.1:8200', // default
  token: '1234' // client token; can be fetched after valid initialization of the server
};

// get new instance of the client
var vault = require("node-vault")(options);

// init vault server
vault.init({ secret_shares: 1, secret_threshold: 1 }, function(err, result) {
  var keys = result.keys;
  vault.token = result.root_token;
  // unseal vault server
  vault.unseal({ secret_shares: 1, key: keys[0] }, function(err, result) {
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

Docs
-------------------------------
Just generate [docco] docs via `npm run docs`.


Examples
-------------------------------
Please have a look at the [examples] and the generated [feature list] to see what is already implemented.

```bash
git clone git@github.com:kr1sp1n/node-vault.git
cd node-vault
npm install
```

Instead of installing all the dependencies like vault itself, postgres and other stuff you can
use [docker] and [docker-compose] to link and run multiple docker containers with all of its dependencies.

The setup for node-vault is defined in a single file: [docker-compose.yml].
To run the examples you need to install the [docker toolbox] first.

A best practice is to add the dockerhost to `/etc/hosts`:
```bash
echo "$(docker-machine ip default) dockerhost" | sudo tee -a /etc/hosts
```
and to add the env variables of the docker machine via:
```bash
eval "$(docker-machine env default)"
```
This line could also be added to you local `.bashrc` or whatever shell you are using.

Please set the endpoint of the vault server to the dockerhost:
```bash
export VAULT_ADDR=http://dockerhost:8200
```

To start just run:
```bash
docker-compose up
```

First of all you should initialize and unseal the vault:
```bash
$(npm bin)/coffee example/init.coffee
```
You should see `root_token: ` followed by a long key in the response.
Please copy that long key and export it as environment variable:
```bash
export VAULT_TOKEN=<insert long key here>
```

Now you are able to run all of the other [examples]:
```bash
$(npm bin)/coffee example/policies.coffee
```



[examples]: https://github.com/kr1sp1n/node-vault/tree/master/example
[docker-compose.yml]: https://github.com/kr1sp1n/node-vault/tree/master/docker-compose.yml
[Vault]: https://vaultproject.io/
[docker-compose]: https://www.docker.com/docker-compose
[docker]: http://docs.docker.com/
[docker toolbox]: https://www.docker.com/toolbox
[docco]: http://jashkenas.github.io/docco
[feature list]: https://github.com/kr1sp1n/node-vault/tree/master/features.md
