process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const options = {
  headers: {
    'X-HELLO': 'world'
  },
  agentOptions: {
    cert: 'mycert',
    key: 'mykey',
    passphrase: 'password',
    securityOptions: 'SSL_OP_NO_SSLv3'
  }
}

const example = async (vault) => {
  await vault.help('sys/policy', options)
  await vault.help('sys/mounts')
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
