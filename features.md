# Supported node-vault features

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


## vault.generateRootStatus

`GET /sys/generate-root/attempt`


## vault.generateRootInit

`PUT /sys/generate-root/attempt`


## vault.generateRootCancel

`DELETE /sys/generate-root/attempt`


## vault.generateRootUpdate

`PUT /sys/generate-root/update`


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


## vault.tokenAccessors

`LIST /auth/token/accessors`


## vault.tokenCreate

`POST /auth/token/create`


## vault.tokenCreateOrphan

`POST /auth/token/create-orphan`


## vault.tokenCreateRole

`POST /auth/token/create/{{role_name}}`


## vault.tokenLookup

`GET /auth/token/lookup/{{token}}`


## vault.tokenLookupAccesspr

`GET /auth/token/lookup-accessor/{{accessor}}`


## vault.tokenLookupSelf

`GET /auth/token/lookup-self`


## vault.tokenRenew

`POST /auth/token/renew`


## vault.tokenRenewSelf

`POST /auth/token/renew-self`


## vault.tokenRevoke

`POST /auth/token/revoke`


## vault.tokenRevokeAccessor

`POST /auth/token/revoke-accessor`


## vault.tokenRevokeOrphan

`POST /auth/token/revoke-orphan`


## vault.tokenRevokeSelf

`POST /auth/token/revoke-self`


## vault.tokenRoles

`GET /auth/token/roles?list=true`


## vault.addTokenRole

`POST /auth/token/roles/{{role_name}}`


## vault.getTokenRole

`GET /auth/token/roles/{{role_name}}`


## vault.removeTokenRole

`DELETE /auth/token/roles/{{role_name}}`


## vault.health

`GET /sys/health`


## vault.leader

`GET /sys/leader`


## vault.stepDown

`PUT /sys/step-down`
