// file: example/policies.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.policies()
.then((result) => {
  console.log(result);
  return vault.addPolicy({
    name: 'mypolicy',
    rules: '{ "path": { "secret/*": { "policy": "write" } } }',
  });
})
.then(() => vault.getPolicy({ name: 'mypolicy' }))
.then(vault.policies)
.then((result) => {
  console.log(result);
  return vault.removePolicy({ name: 'mypolicy' });
})
.catch((err) => console.error(err.message));
