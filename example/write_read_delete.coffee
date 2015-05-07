# file: example/write_read_delete.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../index")()

vault.write 'secret/hello', { value: 'world' }, (err, result)->
  vault.read 'secret/hello', (err, result)->
    vault.delete 'secret/hello', (err, result)->
