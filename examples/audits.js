// file: example/audits.js

process.env.DEBUG = 'node-vault' // switch on debug mode
const vault = require('./../src/main')()
const path = '/tmp/logs/test.log'

const example = async (vault) => {
  if ((await vault.audits()).hasOwnProperty('testlog/')) return undefined
  await vault.enableAudit({ name: 'testlog', type: 'file', options: { path } })
  await vault.write('secret/hello', { value: 'world', lease: '1s' })
  await vault.read('secret/hello')
  await vault.delete('secret/hello')
  await vault.disableAudit({ name: 'testlog' })
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
