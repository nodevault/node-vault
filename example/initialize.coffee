# switch on debug mode
process.env['DEBUG'] = 'vault'

Vault = require("#{__dirname}/../index")

v = new Vault()

v.initialize { secret_shares: 1, secret_threshold: 1 }, (err, result)->
  v.initialized (err, ok)->
