// file: example/createToken.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index.js')();

vault.tokenCreate({
  policies: ['mypolicy']
})
.then(console.log)
.catch((err) => console.error(err.message));
