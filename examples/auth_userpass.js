// file: example/auth_userpass.js

process.env.DEBUG = 'node-vault' // switch on debug mode
const vault = require('./../src/main')()

const mountPoint = 'userpass'
const username = 'me'
const password = 'foo'

const example = async (vault) => {
  if ((await vault.auths()).hasOwnProperty('userpass/')) return undefined
  await vault.enableAuth({
    mount_point: mountPoint,
    type: 'userpass',
    description: 'userpass auth'
  })
  await vault.write(`auth/userpass/users/${username}`, { password, policies: 'root' })
  return vault.userpassLogin({ username, password })
}

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
