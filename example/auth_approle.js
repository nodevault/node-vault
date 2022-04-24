// file: example/auth_approle.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();
const mountPoint = 'approle';
const roleName = 'test-role';

vault.auths()
.then((result) => {
  if (Object.hasOwn(result,'approle/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'approle',
    description: 'Approle auth',
  });
})
.then(() => vault.addApproleRole({ role_name: roleName, policies: 'dev-policy, test-policy' }))
.then(() => Promise.all([vault.getApproleRoleId({ role_name: roleName }),
  vault.getApproleRoleSecret({ role_name: roleName })])
)
.then((result) => {
  const roleId = result[0].data.role_id;
  const secretId = result[1].data.secret_id;
  return vault.approleLogin({ role_id: roleId, secret_id: secretId });
})
.then((result) => {
  console.log(result);
})
.catch((err) => console.error(err.message));
