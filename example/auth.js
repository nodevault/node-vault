// file: example/auth.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

// Note: axios follows redirects by default (up to 5).
// Use maxRedirects in requestOptions to customise this behaviour.
const options = {};

vault.auths(options)
    .then(console.log)
    .catch((err) => console.error(err.message));
