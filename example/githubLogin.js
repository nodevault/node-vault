// file: example/githubLogin.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const token = process.env.GITHUB_TOKEN;

vault.githubLogin({ token })
.then((res) => vault.token = res.auth.client_token)
.then(() => vault.write('secret/hello', { value: 'world', lease: '1s' }))
.catch((err) => console.error(err.message));
