# file: example/mount_postgresql.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

connection = 'postgresql://root:test@postgres:5432/postgres?sslmode=disable'

query = "CREATE ROLE \"{{name}}\"
  WITH LOGIN PASSWORD '{{password}}'
  VALID UNTIL '{{expiration}}';
  GRANT SELECT ON ALL TABLES
  IN SCHEMA public TO \"{{name}}\";"

configure = (done)->
  vault.write 'postgresql/config/lease', { lease: '1h', lease_max: '24h' }, (err, result)->
    return done err if err
    vault.write 'postgresql/config/connection', { value: connection }, done

createRole = (done)->
  vault.write 'postgresql/roles/readonly', { sql: query }, done

getCredentials = (done)->
  vault.read 'postgresql/creds/readonly', done

run = ->
  configure (err, result)->
    createRole (err, result)->
      getCredentials (err, result)->

vault.mounts (err, result)->
  unless result.hasOwnProperty 'postgresql/'
    vault.mount { mount_point: 'postgresql', type: 'postgresql', description: 'postgresql mount test'}, (err, result)->
      run()
  else
    run()
