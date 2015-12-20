# file: src/implemented_routes.coffee

module.exports =
  status:
    method: 'GET'
    path: '/sys/seal-status'
  initialized:
    method: 'GET'
    path: '/sys/init'
  init:
    method: 'PUT'
    path: '/sys/init'
  unseal:
    method: 'PUT'
    path: '/sys/unseal'
  seal:
    method: 'PUT'
    path: '/sys/seal'
  mounts:
    method: 'GET'
    path: '/sys/mounts'
  mount:
    method: 'POST'
    path: '/sys/mounts/{{mount_point}}'
  unmount:
    method: 'DELETE'
    path: '/sys/mounts/{{mount_point}}'
  remount:
    method: 'POST'
    path: '/sys/remount'
  policies:
    method: 'GET'
    path: '/sys/policy'
  addPolicy:
    method: 'PUT'
    path: '/sys/policy/{{name}}'
  getPolicy:
    method: 'GET'
    path: '/sys/policy/{{name}}'
  removePolicy:
    method: 'DELETE'
    path: '/sys/policy/{{name}}'
  auths:
    method: 'GET'
    path: '/sys/auth'
  enableAuth:
    method: 'POST'
    path: '/sys/auth/{{mount_point}}'
  disableAuth:
    method: 'DELETE'
    path: '/sys/auth/{{mount_point}}'
  audits:
    method: 'GET'
    path: '/sys/audit'
  enableAudit:
    method: 'PUT'
    path: '/sys/audit/{{name}}'
  disableAudit:
    method: 'DELETE'
    path: '/sys/audit/{{name}}'
  renew:
    method: 'PUT'
    path: '/sys/renew/{{lease_id}}'
  revoke:
    method: 'PUT'
    path: '/sys/revoke/{{lease_id}}'
  revokePrefix:
    method: 'PUT'
    path: '/sys/revoke-prefix/{{path_prefix}}'
  rotate:
    method: 'PUT'
    path: '/sys/rotate'
