// file: example/init.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.initialized()
.then((result) => {
  console.log(result);
  return vault.init({ secret_shares: 1, secret_threshold: 1 });
})
.then((result) => {
  console.log(result);
  vault.token = result.root_token;
  const key = result.keys[0];
  return vault.unseal({ secret_shares: 1, key });
})
.then(console.log)
.catch((err) => console.error(err.message));
