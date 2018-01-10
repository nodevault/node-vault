// file: example/init.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = async (vault) => {
  console.log(await vault.initialized())
  const result = await vault.init({ secret_shares: 1, secret_threshold: 1 })
  console.log(result)
  vault.login(result.root_token)
  const key = result.keys[0]
  console.log(await vault.unseal({ secret_shares: 1, key }))
  return result
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
