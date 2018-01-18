process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const connection = 'postgresql://root:test@postgres:5432/postgres?sslmode=disable'

const query = "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID " +
"UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";"

const configure = async () => {
  await vault.write('postgresql/config/lease', { lease: '1h', lease_max: '24h' })
  await vault.write('postgresql/config/connection', { value: connection })
}

const createRole = () => vault.write('postgresql/roles/readonly', { sql: query })
const getCredentials = () => vault.read('postgresql/creds/readonly')

const run = async () => {
  await configure()
  await createRole()
  console.log(await getCredentials())
}

const example = async (vault) => {
  if ((await vault.mounts()).hasOwnProperty('postgresql/')) return run()
  await vault.mount({
    mount_point: 'postgresql',
    type: 'postgresql',
    description: 'postgresql mount test'
  })
  await run()
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)
