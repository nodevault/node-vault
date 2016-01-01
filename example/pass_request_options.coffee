# file: example/pass_request_options.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
vault = require("#{__dirname}/../src/index")()

request_options =
  headers:
    'X-HELLO': 'world'
  agentOptions:
    cert: 'mycert'
    key: 'mykey'
    passphrase: 'password',
    securityOptions: 'SSL_OP_NO_SSLv3'

vault.help 'sys/policy', request_options, (err, result)->
  vault.help 'sys/mounts', (err, result)->
