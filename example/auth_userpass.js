// file: example/auth_userpass.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode
const vault = NodeVault();

const mountPoint = 'userpass';
const username = 'me';
const password = 'foo';

vault.auths()
.then((result) => {
  if (Object.hasOwn(result,'userpass/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'userpass',
    description: 'userpass auth',
  });
})
.then(() => vault.write(`auth/userpass/users/${username}`, { password, policies: 'root' }))
.then(() => vault.userpassLogin({ username, password }))
.then(console.log)
.catch((err) => console.error(err.message));
