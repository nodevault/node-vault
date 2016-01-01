# file: example/policies.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

vault.policies (err, result)->
  vault.addPolicy { name: 'mypolicy', rules: '{ "path": { "secret/*": { "policy": "write" } } }' }, (err, result)->
    vault.getPolicy { name: 'mypolicy' }, (err, result)->
      vault.removePolicy { name: 'mypolicy' }, (err, result)->
