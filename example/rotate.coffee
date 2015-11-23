# file: example/rotate.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../index")()

vault.rotate (err, result)->
