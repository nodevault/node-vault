# file: example/audits.coffee

process.env['DEBUG'] = 'vault' # switch on debug mode
Vault = require("#{__dirname}/../index")
vault = Vault.createClient()
fs = require 'fs'

file_path = "#{__dirname}/../test.log"
fd = fs.openSync file_path, 'a+'

vault.audits (err, result)->
  vault.enableAudit { name: 'testlog', type: 'file', options: { path: file_path } }, (err, result)->
    vault.disableAudit { name: 'testlog' }, (err, result)->
      fs.closeSync fd
