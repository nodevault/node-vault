// file: example/write_read_delete.js

import src from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = src();

vault.write('secret/hello', { value: 'world', lease: '1s' })
.then(() => vault.read('secret/hello'))
.then(() => vault.delete('secret/hello'))
.catch((err) => console.error(err.message));
