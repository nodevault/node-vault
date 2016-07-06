// file: example/auth.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

const options = {
  requestOptions: {
    followAllRedirects: true,
  },
};

vault.auths(options)
.then(console.log)
.catch(console.error);
