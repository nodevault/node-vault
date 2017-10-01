// file: example/pass_request_options.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

const options = {
  headers: {
    'X-HELLO': 'world',
  },
  agentOptions: {
    cert: 'mycert',
    key: 'mykey',
    passphrase: 'password',
    securityOptions: 'SSL_OP_NO_SSLv3',
  },
};

vault.help('sys/policy', options)
  .then(() => vault.help('sys/mounts'))
  .catch(err => console.error(err.message));
