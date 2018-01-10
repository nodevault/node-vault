// file: example/status.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = (vault) => vault.status()

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
