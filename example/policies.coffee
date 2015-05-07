# file: example/policies.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../index")()

vault.policies (err, result)->
  vault.addPolicy { name: 'mypolicy' }, (err, result)->
    vault.removePolicy { name: 'mypolicy' }, (err, result)->
