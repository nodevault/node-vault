// file: example/secret_mounts.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

vault.mounts()
.then(() => vault.mount({ mount_point: 'test', type: 'generic', description: 'just a test' }))
.then(() => vault.write('test/hello', { value: 'world', lease: '1s' }))
.then(() => vault.remount({ from: 'test', to: 'test2' }))
.then(() => vault.read('test2/hello'))
.then(console.log)
.then(() => vault.unmount({ mount_point: 'test2' }))
.catch(console.error);
