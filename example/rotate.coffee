# file: example/rotate.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

vault.rotate (err, result)->
