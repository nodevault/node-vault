// file: example/enableAuth_github.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const org = process.env.GITHUB_ORG;
const team = process.env.GITHUB_TEAM;
const mountPoint = 'github';

vault.auths()
.then((result) => {
  if (result.hasOwnProperty('github/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'github',
    description: 'GitHub auth',
  });
})
.then(() => vault.write('auth/github/config', { organization: org }))
.then(() => vault.write(`auth/github/map/teams/${team}`, { value: 'mypolicy' }))
.catch((err) => console.error(err.message));
