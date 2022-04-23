// file: example/status.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index')();

vault.status()
.then(console.log)
.catch((err) => console.error(err.message));
