/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const should = chai.Should

should()
chai.use(dirtyChai)

const vault = require('./../src/main')()
// import features to validate responses against their json schemas
const features = require('./../src/interface/features')
// tv4 is a tool to validate json structures
const tv4 = require('tv4')
const assert = require('assert')

// validates a response by feature name
const validateResponse = (featureName, response) => {
  const schema = features[featureName].schema.res
  return tv4.validate(response, schema)
}

describe('integration', () => {
  describe('node-vault', () => {
    it('should initialize a vault server', (done) => {
      vault.init({ secret_shares: 1, secret_threshold: 1 })
        .then((result) => {
          vault.token = result.root_token
          assert(validateResponse('init', result))
          return done()
        })
        .catch((err) => {
          if (err.message === 'Vault is already initialized') {
            return done()
          }
          return done(err)
        })
    })
    it('should show the current status of the vault server', (done) => {
      vault.status()
        .then((result) => {
          assert(validateResponse('status', result))
          return done()
        })
        .catch(done)
    })
  })
})
