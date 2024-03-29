// file: example/health.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index.js')();

vault.health()
    .then(console.log)
    .catch((err) => console.error(err.message));
