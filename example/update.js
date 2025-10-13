// file: example/update.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.update('secret/hello', { value: 'world', lease: '1s' })
    .then(() => vault.read('secret/hello'))
    .catch((err) => console.error(err.message));

vault.update('secret/hello', { value: 'everyone', lease: '1s' })
    .then(() => vault.read('secret/hello'))
    .catch((err) => console.error(err.message));
