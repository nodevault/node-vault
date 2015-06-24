# file: example/init.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()

vault.initialized (err, result)->
  vault.init { secret_shares: 1, secret_threshold: 1 }, (err, result)->
    return if err
    { keys, root_token } = result
    vault.token = root_token
    vault.unseal { secret_shares: 1, key: keys[0] }, (err, result)->
