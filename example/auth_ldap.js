// file: example/auth_ldap.js

process.env.DEBUG = 'node-vault' // switch on debug mode
const vault = require('./../src/index')()

const mountPoint = 'auth'
const username = 'me'
const password = 'foo'

vault.auths()
.then((result) => {
  if (result.hasOwnProperty('ldap/')) return undefined
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'ldap',
    description: 'ldap auth'
  })
})
.then(() => vault.write(`auth/ldap/users/${username}`, { password, policies: 'root' }))
.then(() => vault.ldapLogin({ username, password }))
.then(console.log)
.catch((err) => console.error(err.message))
