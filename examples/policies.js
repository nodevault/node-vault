// file: example/policies.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = async (vault) => {
  console.log(await vault.policies())
  await vault.addPolicy({
    name: 'mypolicy',
    rules: '{ "path": { "secret/*": { "policy": "write" } } }'
  })
  await vault.getPolicy({ name: 'mypolicy' })
  console.log(await vault.policies())
  return vault.removePolicy({ name: 'mypolicy' })
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
