// file: example/rotate.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index')();

vault.rotate().catch((err) => console.error(err.message));
