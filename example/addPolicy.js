// file: example/addPolicy.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index.js')();

vault.addPolicy({
  name: 'mypolicy',
  rules: '{ "path": { "secret/*": { "policy": "write" } } }',
})
.catch((err) => console.error(err.message));
