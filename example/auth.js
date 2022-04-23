// file: example/auth.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index')();

const options = {
  requestOptions: {
    followAllRedirects: true,
  },
};

vault.auths(options)
.then(console.log)
.catch((err) => console.error(err.message));
