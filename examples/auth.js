// file: example/auth.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const options = {
  requestOptions: {
    followAllRedirects: true
  }
}

const example = (vault) => vault.auths(options)

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
