# file: example/help.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()

vault.help 'sys/policy', (err, result)->
  vault.help 'sys/mounts', (err, result)->
