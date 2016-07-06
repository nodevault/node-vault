// file: example/rotate.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.rotate().catch(console.error);
