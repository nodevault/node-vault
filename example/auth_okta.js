// file: example/auth_okta.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode
const vault = NodeVault();

const org = process.env.OKTA_ORG;
const apiKey = process.env.OKTA_API_TOKEN;
const mountPoint = 'okta';

vault.auths()
.then((result) => {
  if (Object.hasOwn(result,'okta/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'okta',
    description: 'OKTA auth',
  });
})
.then(() => vault.write('auth/okta/config', { org_name: org, api_token: apiKey }))
.then(console.log)
.catch((err) => console.error(err.message));
