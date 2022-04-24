// file: example/token.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.tokenCreate()
.then((result) => {
  console.log(result);
  const newToken = result.auth;
  return vault.tokenLookup({ token: newToken.client_token })
  .then(() => vault.tokenLookupAccessor({ accessor: newToken.accessor }));
})
.then((result) => {
  console.log(result);
})
.catch((err) => console.error(err.message));
