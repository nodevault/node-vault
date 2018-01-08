# Supported Vault features

 This is a generated list of Vault operations supported by node-vault.

## vault.help(path)

`GET <path>?help=1`

Look up the help for a path.

All endpoints in Vault from system paths, secret paths, and credential
providers provide built-in help. This command looks up and outputs that
help.

The command requires that the vault be unsealed, because otherwise
the mount points of the backends are unknown.


## vault.read(path)

`GET <path>`

Read data from Vault.

Reads data at the given path from Vault. This can be used to read
secrets and configuration as well as generate dynamic values from
materialized backends. Please reference the documentation for the
backends in use to determine key structure.


## vault.write(path)

`PUT <path>`

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
prefix the "@" with a slash: "\@".


## vault.list(path)

`LIST <path>`

List data from Vault.

Retrieve a listing of available data. The data returned, if any, is backend-
and endpoint-specific.


## vault.delete(path)

`DELETE <path>`

Delete data (secrets or configuration) from Vault.

Delete sends a delete operation request to the given path. The
behavior of the delete is determined by the backend at the given
path. For example, deleting "aws/policy/ops" will delete the "ops"
policy for the AWS backend. Use "vault help" for more details on
whether delete is supported for a path and what the behavior is.


## vault.status()

`GET /sys/seal-status`

Returns the seal status of the Vault. This is an unauthenticated endpoint.


## vault.initialized()

`GET /sys/init`

Returns the initialization status of the Vault.


## vault.init()

`PUT /sys/init`

Initializes a new vault.


## vault.unseal()

`PUT /sys/unseal`

Unseals the Vault.


## vault.seal()

`PUT /sys/seal`

Seals the Vault.


## vault.generateRootStatus()

`GET /sys/generate-root/attempt`

Reads the configuration and progress of the current root generation attempt.


## vault.generateRootInit()

`PUT /sys/generate-root/attempt`

Initializes a new root generation attempt. Only a single root generation attempt can take place at a time. One (and only one) of otp or pgp_key are required.


## vault.generateRootCancel()

`DELETE /sys/generate-root/attempt`

Cancels any in-progress root generation attempt. This clears any progress made. This must be called to change the OTP or PGP key being used.


## vault.generateRootUpdate()

`PUT /sys/generate-root/update`

TODO: add description :S


## vault.mounts()

`GET /sys/mounts`

Lists all the mounted secret backends.


## vault.mount()

`POST /sys/mounts/{{mount_point}}`

Mount a new secret backend to the mount point in the URL.


## vault.unmount()

`DELETE /sys/mounts/{{mount_point}}`

Unmount the specified mount point.


## vault.remount()

`POST /sys/remount`

Changes the mount point of an already-mounted backend.

### PARAMETERS

    from (string)
        The previous mount point.

    to (string)
        The new mount point.


## vault.policies()

`GET /sys/policy`

List the names of the configured access control policies.


## vault.getPolicy()

`GET /sys/policy/{{name}}`

Retrieve the rules for the named policy.


## vault.addPolicy()

`PUT /sys/policy/{{name}}`

Add or update a policy.


## vault.removePolicy()

`DELETE /sys/policy/{{name}}`

Delete the policy with the given name.


## vault.auths()

`GET /sys/auth`

List the currently enabled credential backends: the name, the type of the backend, and a user friendly description of the purpose for the credential backend.


## vault.enableAuth()

`POST /sys/auth/{{mount_point}}`

Enable a new auth backend.


## vault.disableAuth()

`DELETE /sys/auth/{{mount_point}}`

Disable the auth backend at the given mount point.


## vault.audits()

`GET /sys/audit`

List the currently enabled audit backends.


## vault.enableAudit()

`PUT /sys/audit/{{name}}`

Enable an audit backend at the given path.


## vault.disableAudit()

`DELETE /sys/audit/{{name}}`

Disable the given audit backend.


## vault.renew()

`PUT /sys/leases/renew`

Renew a lease on a secret.

### PARAMETERS

    increment (duration (sec))
        The desired increment in seconds to the lease.

    lease_id (string)
        The lease identifier to renew. This is included with a lease.

    url_lease_id (string)
        The lease identifier to renew. This is included with a lease.

### DESCRIPTION

When a secret is read, it may optionally include a lease interval
and a boolean indicating if renew is possible. For secrets that support
lease renewal, this endpoint is used to extend the validity of the
lease and to prevent an automatic revocation.


## vault.revoke()

`PUT /sys/leases/revoke`

Revoke a leased secret immediately

### PARAMETERS

    lease_id (string)
        The lease identifier to renew. This is included with a lease.

    url_lease_id (string)
        The lease identifier to renew. This is included with a lease.

### DESCRIPTION

When a secret is generated with a lease, it is automatically revoked
at the end of the lease period if not renewed. However, in some cases
you may want to force an immediate revocation. This endpoint can be
used to revoke the secret with the given Lease ID.


## vault.revokePrefix()

`PUT /sys/revoke-prefix/{{path_prefix}}`

TODO: add description :S


## vault.rotate()

`PUT /sys/rotate`

Rotates the backend encryption key used to persist data.


### DESCRIPTION

Rotate generates a new encryption key which is used to encrypt all
data going to the storage backend. The old encryption keys are kept so
that data encrypted using those keys can still be decrypted.


## vault.unwrap()

`POST /sys/wrapping/unwrap`

Unwraps a response-wrapped token.

### PARAMETERS

    token (string)
        The unwrap token.

### DESCRIPTION

Unwraps a response-wrapped token. Unlike simply reading from cubbyhole/response,
this provides additional validation on the token, and rather than a JSON-escaped
string, the returned response is the exact same as the contained wrapped response.


## vault.githubLogin()

`POST /auth/{{mount_point}}{{^mount_point}}github{{/mount_point}}/login`

TODO: add description :S


## vault.userpassLogin()

`POST /auth/{{mount_point}}{{^mount_point}}userpass{{/mount_point}}/login/{{username}}`

TODO: add description :S


## vault.ldapLogin()

`POST /auth/{{mount_point}}{{^mount_point}}ldap{{/mount_point}}/login/{{username}}`

TODO: add description :S


## vault.oktaLogin()

`POST /auth/{{mount_point}}{{^mount_point}}okta{{/mount_point}}/login/{{username}}`

TODO: add description :S


## vault.radiusLogin()

`POST /auth/{{mount_point}}{{^mount_point}}radius{{/mount_point}}/login/{{username}}`

TODO: add description :S


## vault.tokenAccessors()

`LIST /auth/token/accessors`

TODO: add description :S


## vault.tokenCreate()

`POST /auth/token/create`

TODO: add description :S


## vault.tokenCreateOrphan()

`POST /auth/token/create-orphan`

TODO: add description :S


## vault.tokenCreateRole()

`POST /auth/token/create/{{role_name}}`

TODO: add description :S


## vault.tokenLookup()

`POST /auth/token/lookup`

TODO: add description :S


## vault.tokenLookupAccessor()

`POST /auth/token/lookup-accessor`

TODO: add description :S


## vault.tokenLookupSelf()

`GET /auth/token/lookup-self`

TODO: add description :S


## vault.tokenRenew()

`POST /auth/token/renew`

TODO: add description :S


## vault.tokenRenewSelf()

`POST /auth/token/renew-self`

TODO: add description :S


## vault.tokenRevoke()

`POST /auth/token/revoke`

TODO: add description :S


## vault.tokenRevokeAccessor()

`POST /auth/token/revoke-accessor`

TODO: add description :S


## vault.tokenRevokeOrphan()

`POST /auth/token/revoke-orphan`

TODO: add description :S


## vault.tokenRevokeSelf()

`POST /auth/token/revoke-self`

TODO: add description :S


## vault.tokenRoles()

`GET /auth/token/roles?list=true`

TODO: add description :S


## vault.addTokenRole()

`POST /auth/token/roles/{{role_name}}`

TODO: add description :S


## vault.getTokenRole()

`GET /auth/token/roles/{{role_name}}`

TODO: add description :S


## vault.removeTokenRole()

`DELETE /auth/token/roles/{{role_name}}`

TODO: add description :S


## vault.approleRoles()

`LIST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role`

TODO: add description :S


## vault.addApproleRole()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}`

TODO: add description :S


## vault.getApproleRole()

`GET /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}`

TODO: add description :S


## vault.deleteApproleRole()

`DELETE /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}`

TODO: add description :S


## vault.getApproleRoleId()

`GET /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/role-id`

TODO: add description :S


## vault.updateApproleRoleId()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/role-id`

TODO: add description :S


## vault.getApproleRoleSecret()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id`

TODO: add description :S


## vault.approleSecretAccessors()

`LIST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id`

TODO: add description :S


## vault.approleSecretLookup()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id/lookup`

TODO: add description :S


## vault.approleSecretDestroy()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id/destroy`

TODO: add description :S


## vault.approleSecretAccessorLookup()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id-accessor/lookup`

TODO: add description :S


## vault.approleSecretAccessorDestroy()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/secret-id-accessor/destroy`

TODO: add description :S


## vault.approleLogin()

`POST /auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/login`

TODO: add description :S


## vault.health()

`GET /sys/health`

TODO: add description :S


## vault.leader()

`GET /sys/leader`

TODO: add description :S


## vault.stepDown()

`PUT /sys/step-down`

TODO: add description :S
