# file: example/policies.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()

vault.policies (err, result)->
  vault.addPolicy { name: 'mypolicy' }, (err, result)->
    vault.removePolicy { name: 'mypolicy' }, (err, result)->
