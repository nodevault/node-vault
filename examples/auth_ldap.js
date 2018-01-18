process.env.DEBUG = 'node-vault' // switch on debug mode
const vault = require('./../src/main')()

const mountPoint = 'auth'
const username = 'me'
const password = 'foo'

const example = async (vault) => {
  if ((await vault.auths()).hasOwnProperty('ldap/')) return undefined
  await vault.enableAuth({
    mount_point: mountPoint,
    type: 'ldap',
    description: 'ldap auth'
  })
  await vault.write(`auth/ldap/users/${username}`, { password, policies: 'root' })
  return vault.ldapLogin({ username, password })
}

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
