# switch on debug mode
process.env['DEBUG'] = 'vault'

Vault = require("#{__dirname}/../index")

v = new Vault()

v.initialized (err, result)->
  v.initialize { secret_shares: 1, secret_threshold: 1 }, (err, result)->
    return if err
    { keys, root_token } = result
    v.token = root_token
    v.unseal { secret_shares: 1, key: keys[0] }, (err, result)->
      # v.getSelfToken (err, result)->
      # v.getPolicies (err, result)->
      # v.getAuthBackends (err, result)->
      v.addAuthBackend { mount_point: 'github', type: 'github'}, (err, result)->
        v.configureAuthBackend { mount_point: 'github', organization: 'HitFox'}, (err, result)->
          v.mapGithubTeam { mount_point: 'github', team: 'hitfox-devops', value: 'root' }
