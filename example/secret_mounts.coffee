# file: example/secret_mounts.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

vault.mounts (err, result)->
  vault.mount { mount_point: 'test', type: 'generic', description: 'just a test'}, (err, result)->
    vault.remount { from: 'test', to: 'test2'}, (err, result)->
      vault.unmount { mount_point: 'test2'}, (err, result)->
