// file: example/write_read_delete.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index')();

vault.write('secret/hello', { value: 'world', lease: '1s' })
.then(() => vault.read('secret/hello'))
.then(() => vault.delete('secret/hello'))
.catch((err) => console.error(err.message));
