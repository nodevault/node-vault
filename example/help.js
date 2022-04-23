// file: example/help.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index.js')();

vault.help('sys/policy')
.then(console.log)
.catch((err) => console.error(err.message));
