# file: example/auth.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

org = process.env['GITHUB_ORG']
team = process.env['GITHUB_TEAM'] or 'owners'
policy = process.env['VAULT_POLICY'] or 'root'
token = process.env['GITHUB_TOKEN']

vault.enableAuth { mount_point: 'github', type: 'github', description: 'GitHub auth' }, (err, result)->
  vault.write 'auth/github/config', { organization: org }, (err, result)->
    vault.write "auth/github/map/teams/#{team}", value: 'root', (err, result)->
      vault.write 'auth/github/login', token: token, (err, result)->
        vault.disableAuth { mount_point: 'github' }, (err, result)->
