// file: example/audits.js

process.env.DEBUG = 'vaultaire'; // switch on debug mode
const vault = require('./../src/index')();
const path = '/tmp/logs/test.log';

vault.audits()
.then((result) => {
  if (result.hasOwnProperty('testlog/')) return undefined;
  return vault.enableAudit({ name: 'testlog', type: 'file', options: { path } });
})
.then(() => vault.write('secret/hello', { value: 'world', lease: '1s' }))
.then(() => vault.read('secret/hello'))
.then(() => vault.delete('secret/hello'))
.then(() => vault.disableAudit({ name: 'testlog' }))
.catch((err) => console.error(err.message));
