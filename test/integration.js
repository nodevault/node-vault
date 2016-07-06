const should = require('should');
const vault = require('./../src/index.js')();

describe('node-vault integration', () => {
  it('should initialize a vault server', (done) => {
    vault.init({ secret_shares: 1, secret_threshold: 1 })
    .then((result) => {
      vault.token = result.root_token;
      result.should.have.property('keys');
      result.should.have.property('root_token');
      return done();
    })
    .catch(done);
  });
});
