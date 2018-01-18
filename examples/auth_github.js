process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const org = process.env.GITHUB_ORG
const team = process.env.GITHUB_TEAM || 'owners'
const token = process.env.GITHUB_TOKEN
const mountPoint = 'github'

const example = async (vault) => {
  if ((await vault.auths()).hasOwnProperty('github/')) return undefined
  await vault.enableAuth({
    mount_point: mountPoint,
    type: 'github',
    description: 'GitHub auth'
  })
  await vault.write('auth/github/config', { organization: org })
  await vault.write(`auth/github/map/teams/${team}`, { value: 'root' })
  return vault.githubLogin({ token })
}

module.exports = example

if (require.main === module) example(vault).then(console.log).catch(console.error)
