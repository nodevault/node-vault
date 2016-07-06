// file: example/init.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.initialized()
.then((result) => {
  console.log(result);
  return vault.init({ secret_shares: 1, secret_threshold: 1 });
})
.then((result) => {
  console.log(result);
  vault.token = result.root_token;
  const key = result.keys[0];
  return vault.unseal({ secret_shares: 1, key: key });
})
.then(console.log)
.catch(function (err) {
  console.error(err);
});
