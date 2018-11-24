// file: example/auth_okta.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const org = process.env.OKTA_ORG;
const apiKey = process.env.OKTA_API_TOKEN;
const mountPoint = 'okta';

vault.auths()
.then((result) => {
  if (result.hasOwnProperty('okta/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'okta',
    description: 'OKTA auth',
  });
})
.then(() => vault.write('auth/okta/config', { org_name: org, api_token: apiKey }))
.then(console.log)
.catch((err) => console.error(err.message));
