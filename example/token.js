// file: example/token.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = require('./../src/index')();

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
