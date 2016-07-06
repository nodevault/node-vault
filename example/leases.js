// file: example/leases.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

vault.write('secret/hello', { value: 'world', lease: '10h' })
.then(() => vault.read('secret/hello'))
.then((result) => vault.revoke({ lease_id: result.lease_id }))
.then(() => vault.revokePrefix({ path_prefix: 'secret' }))
.catch(console.error);
