// file: example/status.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.status()
.then(console.log)
.catch(console.error);
