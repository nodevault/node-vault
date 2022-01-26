// file: example/help.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('../src/index')();

vault.help('sys/policy')
  .then(console.log)
  .catch((err) => console.error(err.message));
