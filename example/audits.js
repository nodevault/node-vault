// file: example/audits.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();
const file_path = '/tmp/logs/test.log';

vault.audits()
.then((result) => {
  if (!result.hasOwnProperty('testlog/')) {
    return vault.enableAudit({ name: 'testlog', type: 'file', options: { path: file_path } });
  }
})
.then(() => vault.write('secret/hello', { value: 'world', lease: '1s' }))
.then(() => vault.read('secret/hello'))
.then(() => vault.delete('secret/hello'))
.then(() => vault.disableAudit({ name: 'testlog' }))
.catch((err) => console.error(err));
