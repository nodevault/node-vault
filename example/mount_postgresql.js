// file: example/mount_postgresql.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

const connection = 'postgresql://root:test@postgres:5432/postgres?sslmode=disable';

const query = "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";";

const configure = () => {
  return vault.write('postgresql/config/lease', { lease: '1h', lease_max: '24h' })
  .then(() => vault.write('postgresql/config/connection', { value: connection }));
};

const createRole = () => vault.write('postgresql/roles/readonly', { sql: query });
const getCredentials = () => vault.read('postgresql/creds/readonly');

const run = () => {
  return configure()
  .then(createRole)
  .then(getCredentials)
  .then(console.log);
};

vault.mounts()
.then((result) => {
  if (!result.hasOwnProperty('postgresql/')) {
    return vault.mount({ mount_point: 'postgresql', type: 'postgresql', description: 'postgresql mount test' })
    .then(run);
  } else {
    return run();
  }
})
.catch(console.error);
