process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main.js')()

const example = (vault) => vault.help('sys/policy')

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
