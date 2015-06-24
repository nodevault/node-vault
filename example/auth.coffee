# file: example/auth.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()

vault.auths (err, result)->
