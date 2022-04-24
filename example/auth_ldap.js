// file: example/auth_ldap.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode
const vault = NodeVault();

const mountPoint = 'auth';
const username = 'me';
const password = 'foo';

vault.auths()
.then((result) => {
  if (Object.hasOwn(result,'ldap/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'ldap',
    description: 'ldap auth',
  });
})
.then(() => vault.write(`auth/ldap/users/${username}`, { password, policies: 'root' }))
.then(() => vault.ldapLogin({ username, password }))
.then(console.log)
.catch((err) => console.error(err.message));
