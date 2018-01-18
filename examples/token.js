process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = async (vault) => {
  const result = await vault.tokenCreate()
  console.log(result)
  const newToken = result.auth
  await vault.tokenLookup({ token: newToken.client_token })
  await vault.tokenLookupAccessor({ accessor: newToken.accessor })
}

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
