# file: example/leases.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()

vault.write 'secret/hello', { value: 'world', lease: '10h' }, (err, result)->
  vault.read 'secret/hello', (err, result)->
    vault.revoke { lease_id: result.lease_id }, (err, result)->
      vault.revokePrefix { path_prefix: 'secret' }, (err, result)->
