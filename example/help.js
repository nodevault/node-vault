// file: example/help.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

vault = require('./../src/index.js')();

vault.help('sys/policy')
  .then(function (result) {
    console.log(result);
  })
  .catch(function (err) {
    console.error(err);
  });
