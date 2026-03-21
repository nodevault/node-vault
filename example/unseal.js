// file: example/unseal.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

// Unseal a vault server that is already initialized.
// Provide one of the unseal keys from the init response.
// If the vault was initialized with secret_threshold > 1,
// you must call unseal multiple times with different keys
// until the threshold is met.
const key = process.env.UNSEAL_KEY;

vault.unseal({ key })
    .then(console.log)
    .catch((err) => console.error(err.message));
