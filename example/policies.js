// file: example/policies.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
vault = require('./../src/index')();

vault.policies()
  .then(function (result) {
    console.log(result);
    return vault.addPolicy({ name: 'mypolicy', rules: '{ "path": { "secret/*": { "policy": "write" } } }' })
      .then(function () {
        return vault.getPolicy({ name: 'mypolicy' })
          .then(function (result) {
            console.log(result);
            return vault.removePolicy({ name: 'mypolicy' });
          });
      });
  })
  .catch(function (err) {
    console.error(err);
    console.log(err.stack);
  });
