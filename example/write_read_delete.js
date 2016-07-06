// file: example/write_read_delete.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.write('secret/hello', { value: 'world', lease: '1s' })
.then(() => vault.read('secret/hello'))
.then(() => vault.delete('secret/hello'))
.catch(console.error);
