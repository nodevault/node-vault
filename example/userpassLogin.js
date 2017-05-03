// file: example/userpassLogin.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const username = 'me';
const password = 'foo';

vault.userpassLogin({ username, password })
.then((res) => vault.token = res.auth.client_token)
.then(() => vault.write('secret/hello', { value: 'world', lease: '1s' }))
.catch((err) => console.error(err.message));
