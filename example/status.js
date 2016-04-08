// file: example/status.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

vault = require('./../src/index.js')();

vault.status()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (err) {
    console.error(err);
  });
