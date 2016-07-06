// file: example/policies.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.policies()
.then((result) => {
  console.log(result);
  return vault.addPolicy({ name: 'mypolicy', rules: '{ "path": { "secret/*": { "policy": "write" } } }' });
})
.then(() => vault.getPolicy({ name: 'mypolicy' }))
.then(vault.policies)
.then((result) => {
  console.log(result);
  return vault.removePolicy({ name: 'mypolicy' });
})
.catch(console.error);
