// file: example/init.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
vault = require('./../src/index')();

vault.initialized()
  .then(function (result) {
    console.log(result);
    return vault.init({ secret_shares: 1, secret_threshold: 1 })
      .then(function (result) {
        vault.token = result.root_token;
        const key = result.keys[0];
        return vault.unseal({ secret_shares: 1, key: key });
      });
  })
  .catch(function (err) {
    console.error(err);
  });
