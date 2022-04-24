// file: example/rotate.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'vaultaire'; // switch on debug mode

const vault = NodeVault();

vault.rotate().catch((err) => console.error(err.message));
