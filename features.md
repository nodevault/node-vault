# Supported Vault Features

 This is a generated list of Vault features supported by node-vault.

## vault.status

`GET /sys/seal-status`

## vault.initialized

`GET /sys/init`

## vault.init

`PUT /sys/init`

## vault.unseal

`PUT /sys/unseal`

## vault.seal

`PUT /sys/seal`

## vault.mounts

`GET /sys/mounts`

## vault.mount

`POST /sys/mounts/{{mount_point}}`

## vault.unmount

`DELETE /sys/mounts/{{mount_point}}`

## vault.remount

`POST /sys/remount`

## vault.policies

`GET /sys/policy`

## vault.addPolicy

`PUT /sys/policy/{{name}}`

## vault.getPolicy

`GET /sys/policy/{{name}}`

## vault.removePolicy

`DELETE /sys/policy/{{name}}`

## vault.auths

`GET /sys/auth`

## vault.enableAuth

`POST /sys/auth/{{mount_point}}`

## vault.disableAuth

`DELETE /sys/auth/{{mount_point}}`

## vault.audits

`GET /sys/audit`

## vault.enableAudit

`PUT /sys/audit/{{name}}`

## vault.disableAudit

`DELETE /sys/audit/{{name}}`

## vault.renew

`PUT /sys/renew/{{lease_id}}`

## vault.revoke

`PUT /sys/revoke/{{lease_id}}`

## vault.revokePrefix

`PUT /sys/revoke-prefix/{{path_prefix}}`

## vault.rotate

`PUT /sys/rotate`

## vault.githubLogin

`POST /auth/github/login`

## vault.userpassLogin

`POST /auth/userpass/login/{{username}}`