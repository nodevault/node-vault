process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()
const mountPoint = 'approle'
const roleName = 'test-role'

const example = async (vault) => {
  if ((await vault.auths()).hasOwnProperty('approle/')) return undefined
  await vault.enableAuth({
    mount_point: mountPoint,
    type: 'approle',
    description: 'Approle auth'
  })

  await vault.addApproleRole({ role_name: roleName, policies: 'dev-policy, test-policy' })
  const result =
    await Promise.all([vault.getApproleRoleId({ role_name: roleName }),
      vault.getApproleRoleSecret({ role_name: roleName })])
  const roleId = result[0].data.role_id
  const secretId = result[1].data.secret_id
  return vault.approleLogin({ role_id: roleId, secret_id: secretId })
}

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
