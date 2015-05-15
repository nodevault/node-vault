# file: example/auth.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../index")()

vault.auths (err, result)->
