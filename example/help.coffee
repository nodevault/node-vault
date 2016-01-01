# file: example/help.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

vault.help 'sys/policy', (err, result)->
  vault.help 'sys/mounts', (err, result)->
