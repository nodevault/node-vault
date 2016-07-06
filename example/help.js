// file: example/help.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index.js')();

vault.help('sys/policy')
.then(console.log)
.catch(console.error);
