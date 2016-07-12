const should = require('should');
const vault = require('./../src/index.js')();
// use json schema in commands.js validate response
const commands = require('./../src/commands.js');
const tv4 = require('tv4');
const assert = require('assert');

const validResult = (commandName, result) => {
  const schema = commands[commandName].schema.res;
  return tv4.validate(result, schema);
};

describe('integration', () => {
  describe('node-vault', () => {
    it('should initialize a vault server', (done) => {
      vault.init({ secret_shares: 1, secret_threshold: 1 })
      .then((result) => {
        vault.token = result.root_token;
        assert(validResult('init', result));
        return done();
      })
      .catch(done);
    });
    it('should show the current status of the vault server', (done) => {
      vault.status()
      .then((result) => {
        assert(validResult('status', result));
        return done();
      })
      .catch(done);
    });
  });
});
