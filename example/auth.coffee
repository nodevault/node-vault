# file: example/auth.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../index")()

vault.auths (err, result)->
  vault.enableAuth { mount_point: 'github', type: 'github', description: 'GitHub auth' }, (err, result)->
    vault.disableAuth { mount_point: 'github' }, (err, result)->
