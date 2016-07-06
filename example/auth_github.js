// file: example/auth_github.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const org = process.env.GITHUB_ORG;
const team = process.env.GITHUB_TEAM || 'owners';
const policy = process.env.VAULT_POLICY || 'root';
const token = process.env.GITHUB_TOKEN;
const mountPoint = 'github';

vault.auths()
.then((result) => {
  if (!result.hasOwnProperty('github/')) {
    return vault.enableAuth({ mount_point: mountPoint, type: 'github', description: 'GitHub auth' });
  }
})
.then(() => {
  return vault.write('auth/github/config', { organization: org })
  .then(() => vault.write('auth/github/map/teams/' + team, { value: 'root' }))
  .then(() => vault.githubLogin({ token: token }))
  .then(console.log);
})
.catch((err) => console.error(err));
