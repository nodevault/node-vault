// file: example/auth.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.auths()
.then(console.log)
.catch(console.error);
