// file: example/transit.js

import NodeVault from "./../src/index";

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = NodeVault();

const planTextValue = 'super-secret-text';
const vaultKey = 'transit-encryption-key';

function encode(input) {
    return Buffer.from(input).toString('utf8');
}

function decode(input) {
    return Buffer.from(input, 'base64').toString('utf8');
}

Promise.resolve()
    .then(() =>
        vault.encryptData({ name: vaultKey, plainText: encode(planTextValue) })
    )
    .then(encryptResponse =>
        vault.decryptData({
            name: vaultKey,
            cipherText: encryptResponse.data.ciphertext,
        })
    )
    .then(decryptResponse => {
        const value = decode(decryptResponse.data.plaintext);
        console.log(value);
    })
    .catch(err => {
        console.error(err.message);
    });