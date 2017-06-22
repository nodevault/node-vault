// file: example/token.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

const vault = require('./../src/index')();

let new_token

vault.tokenCreate()
.then((result) => {
	console.log(result)
	new_token = result.auth
	return vault.tokenLookup({token: new_token.client_token})
})
.then((result) => {
	console.log(result)
	return vault.tokenLookupAccessor({accessor: new_token.accessor})
})
.then((result) => {
	console.log(result)
})
.catch((err) => console.error(err.message))
