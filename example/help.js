// file: example/help.js

import NodeVault from "./../src/index.js";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.help('sys/policy')
.then(console.log)
.catch((err) => console.error(err.message));
