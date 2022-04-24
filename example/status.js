// file: example/status.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.status()
.then(console.log)
.catch((err) => console.error(err.message));
