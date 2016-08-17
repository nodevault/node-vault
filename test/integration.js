'use strict';
/* eslint-disable import/no-extraneous-dependencies */

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import tv4 from 'tv4';
import assert from 'assert';
// use json schema in commands.js validate response
import commands from './../src/commands.js';
import vaultjs from './../src/index.js';

const should = chai.Should;
should();
chai.use(dirtyChai);
const vault = vaultjs();


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
