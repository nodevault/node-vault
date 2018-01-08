module.exports = [{
  // vault help
  name: 'help',
  query: '?help=1',
  operation: 'GET',
  description: `

Look up the help for a path.

All endpoints in Vault from system paths, secret paths, and credential
providers provide built-in help. This command looks up and outputs that
help.

The command requires that the vault be unsealed, because otherwise
the mount points of the backends are unknown.

    `.trim()

// vault data operations
}, {
  // - read
  name: 'read',
  operation: 'GET',
  description: `

Read data from Vault.

Reads data at the given path from Vault. This can be used to read
secrets and configuration as well as generate dynamic values from
materialized backends. Please reference the documentation for the
backends in use to determine key structure.

    `.trim()
}, {
  // - write
  name: 'write',
  operation: 'PUT',
  description: `

Write data (secrets or configuration) into Vault.

Write sends data into Vault at the given path. The behavior of the write is
determined by the backend at the given path. For example, writing to
"aws/policy/ops" will create an "ops" IAM policy for the AWS backend
(configuration), but writing to "consul/foo" will write a value directly into
Consul at that key. Check the documentation of the logical backend you're
using for more information on key structure.

Data is sent via additional arguments in "key=value" pairs. If value begins
with an "@", then it is loaded from a file. Write expects data in the file to
be in JSON format. If you want to start the value with a literal "@", then
prefix the "@" with a slash: "\\@".

    `.trim()
}, {
  // - list
  name: 'list',
  operation: 'LIST',
  description: `

List data from Vault.

Retrieve a listing of available data. The data returned, if any, is backend-
and endpoint-specific.

    `.trim()
}, {
  // - delete
  name: 'delete',
  operation: 'DELETE',
  description: `

Delete data (secrets or configuration) from Vault.

Delete sends a delete operation request to the given path. The
behavior of the delete is determined by the backend at the given
path. For example, deleting "aws/policy/ops" will delete the "ops"
policy for the AWS backend. Use "vault help" for more details on
whether delete is supported for a path and what the behavior is.
  
    `.trim()
}]
