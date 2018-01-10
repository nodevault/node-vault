// file: example/rotate.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = (vault) => vault.rotate()

module.exports = example

if (require.main === module) example(vault).catch(console.error)
