// file: example/auth.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

const options = {
  requestOptions: {
    followAllRedirects: true,
  },
};

vault.auths(options)
.then(console.log)
.catch((err) => console.error(err.message));
