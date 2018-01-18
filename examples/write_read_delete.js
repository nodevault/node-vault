process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = async (vault) => {
  await vault.write('secret/hello', { value: 'world', lease: '1s' })
  await vault.read('secret/hello')
  await vault.delete('secret/hello')
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
