// file: example/auth_github.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const mountPoint = 'github';

vault.auths()
.then((result) => {
  if (!result.hasOwnProperty('github/')) return undefined;
  return vault.disableAuth({
    mount_point: mountPoint
  });
})
.catch((err) => console.error(err.message));
