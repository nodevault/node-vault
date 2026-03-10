// file: example/pass_request_options.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

// Pass request options at initialization time.
// These options are forwarded to postman-request for every request.
const vault = require('./../src/index')({
    requestOptions: {
        agentOptions: {
            cert: 'mycert',
            key: 'mykey',
            passphrase: 'password',
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
        cert: 'mycert',
        key: 'mykey',
        passphrase: 'password',
        securityOptions: 'SSL_OP_NO_SSLv3',
    },
};

vault.help('sys/policy', perCallOptions)
    .then(() => vault.help('sys/mounts'))
    .catch((err) => console.error(err.message));
