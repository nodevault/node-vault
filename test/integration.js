import NodeVault from "./../src/index.js";
import chai from "chai";
import dirtyChai from "dirty-chai";

// use json schema in commands.js validate response
import Commands from "./../src/commands.js";
import tv4 from "tv4";
import assert from "assert";

const should = chai.Should;
should();
chai.use(dirtyChai);

const vault = NodeVault();
const validResult = (commandName, result) => {
  const schema = Commands[commandName].schema.res;
  return tv4.validate(result, schema);
};

describe('integration', () => {
  describe('vaultaire', () => {
    it('should initialize a vault server', (done) => {
      vault.init({ secret_shares: 1, secret_threshold: 1 })
      .then((result) => {
        vault.token = result.root_token;
        assert(validResult('init', result));
        return done();
      })
      .catch((err) => {
        if (err.message === 'Vault is already initialized') {
          return done();
        }
        return done(err);
      });
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
