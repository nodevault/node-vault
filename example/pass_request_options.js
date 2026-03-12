// file: example/pass_request_options.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

// Pass request options at initialization time.
// TLS options (ca, cert, key, passphrase, agentOptions) are mapped to an
// https.Agent and forwarded to axios for every request.
const vault = require('./../src/index')({
    requestOptions: {
        agentOptions: {
            cert: '<path-to-cert>',
            key: '<path-to-key>',
            passphrase: '<your-passphrase>',
            securityOptions: 'SSL_OP_NO_SSLv3',
        },
    },
});

// You can also pass (or override) request options per-call.
const perCallOptions = {
    headers: {
        'X-HELLO': 'world',
    },
    agentOptions: {
        cert: '<path-to-cert>',
        key: '<path-to-key>',
        passphrase: '<your-passphrase>',
        securityOptions: 'SSL_OP_NO_SSLv3',
    },
};

vault.help('sys/policy', perCallOptions)
    .then(() => vault.help('sys/mounts'))
    .catch((err) => console.error(err.message));
