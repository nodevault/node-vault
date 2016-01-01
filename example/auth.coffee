# file: example/auth.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

vault.auths (err, result)->
