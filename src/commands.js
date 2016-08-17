'use strict';

export default {
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    schema: {
      res: {
        type: 'object',
        properties: {
          sealed: {
            type: 'boolean',
          },
          t: {
            type: 'number',
          },
          n: {
            type: 'number',
          },
          progress: {
            type: 'number',
          },
        },
        required: ['sealed', 't', 'n', 'progress'],
      },
    },
  },
  initialized: {
    method: 'GET',
    path: '/sys/init',
  },
  init: {
    method: 'PUT',
    path: '/sys/init',
    schema: {
      req: {
        type: 'object',
        properties: {
          secret_shares: {
            type: 'integer',
            minimum: 1,
          },
          secret_threshold: {
            type: 'integer',
            minimum: 1,
          },
          pgp_keys: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
        },
        required: ['secret_shares', 'secret_threshold'],
      },
      res: {
        type: 'object',
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
          root_token: {
            type: 'string',
          },
        },
        required: ['keys', 'root_token'],
      },
    },
  },
  unseal: {
    method: 'PUT',
    path: '/sys/unseal',
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal',
  },
  mounts: {
    method: 'GET',
    path: '/sys/mounts',
  },
  mount: {
    method: 'POST',
    path: '/sys/mounts/{{mount_point}}',
  },
  unmount: {
    method: 'DELETE',
    path: '/sys/mounts/{{mount_point}}',
  },
  remount: {
    method: 'POST',
    path: '/sys/remount',
  },
  policies: {
    method: 'GET',
    path: '/sys/policy',
  },
  addPolicy: {
    method: 'PUT',
    path: '/sys/policy/{{name}}',
  },
  getPolicy: {
    method: 'GET',
    path: '/sys/policy/{{name}}',
  },
  removePolicy: {
    method: 'DELETE',
    path: '/sys/policy/{{name}}',
  },
  auths: {
    method: 'GET',
    path: '/sys/auth',
  },
  enableAuth: {
    method: 'POST',
    path: '/sys/auth/{{mount_point}}',
  },
  disableAuth: {
    method: 'DELETE',
    path: '/sys/auth/{{mount_point}}',
  },
  audits: {
    method: 'GET',
    path: '/sys/audit',
  },
  enableAudit: {
    method: 'PUT',
    path: '/sys/audit/{{name}}',
  },
  disableAudit: {
    method: 'DELETE',
    path: '/sys/audit/{{name}}',
  },
  renew: {
    method: 'PUT',
    path: '/sys/renew/{{lease_id}}',
  },
  revoke: {
    method: 'PUT',
    path: '/sys/revoke/{{lease_id}}',
  },
  revokePrefix: {
    method: 'PUT',
    path: '/sys/revoke-prefix/{{path_prefix}}',
  },
  rotate: {
    method: 'PUT',
    path: '/sys/rotate',
  },
  githubLogin: {
    method: 'POST',
    path: '/auth/github/login',
  },
  userpassLogin: {
    method: 'POST',
    path: '/auth/userpass/login/{{username}}',
  },
};
