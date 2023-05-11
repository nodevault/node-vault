module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "commonjs": true,
        "mocha": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-prototype-builtins": "warn",
        "indent": ["error", 4]
    }
}