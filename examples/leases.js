// file: example/leases.js

process.env.DEBUG = 'node-vault' // switch on debug mode
const vault = require('./../src/main')()

// TODO fix example for leases because generic backend does not generate a lease_id anymore
// See: https://github.com/hashicorp/vault/issues/877

const example = async (vault) => {
  await vault.write('secret/hello', { value: 'world', lease: '10h' })
  const result = await vault.read('secret/hello')
  await vault.revoke({ lease_id: result.lease_id })
  await vault.revokePrefix({ path_prefix: 'secret' })
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
