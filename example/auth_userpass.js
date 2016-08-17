// file: example/auth_userpass.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const mountPoint = 'userpass';
const username = 'me';
const password = 'foo';

vault.auths()
.then((result) => {
  if ({}.hasOwnProperty.call(result, 'userpass/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'userpass',
    description: 'userpass auth',
  });
})
.then(() => vault.write(`auth/userpass/users/${username}`, { password, policies: 'root' }))
.then(() => vault.userpassLogin({ username, password }))
.then(console.log)
.catch((err) => console.error(err));
