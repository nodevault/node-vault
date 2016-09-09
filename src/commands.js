const sealStatusResponse = {
  type: 'object',
  properties: {
    sealed: {
      type: 'boolean',
    },
    t: {
      type: 'integer',
    },
    n: {
      type: 'integer',
    },
    progress: {
      type: 'integer',
    },
  },
  required: ['sealed', 't', 'n', 'progress'],
};

const tokenResponse = {
  type: 'object',
  properties: {
    auth: {
      type: 'object',
      properties: {
        client_token: {
          type: 'string',
        },
        policies: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        metadata: {
          type: 'object',
        },
        lease_duration: {
          type: 'integer',
        },
        renewable: {
          type: 'boolean',
        },
      },
    },
  },
  required: ['auth'],
};

module.exports = {
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    schema: {
      res: sealStatusResponse,
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
    schema: {
      res: sealStatusResponse,
    },
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal',
  },
  generateRootStatus: {
    method: 'GET',
    path: '/sys/generate-root/attempt',
    schema: {
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean',
          },
          nonce: {
            type: 'string',
          },
          progress: {
            type: 'integer',
            minimum: 0,
          },
          required: {
            type: 'integer',
            minimum: 1,
          },
          pgp_fingerprint: {
            type: 'string',
          },
          complete: {
            type: 'boolean',
          },
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete'],
      },
    },
  },
  generateRootInit: {
    method: 'PUT',
    path: '/sys/generate-root/attempt',
    schema: {
      req: {
        type: 'object',
        properties: {
          otp: {
            type: 'string',
          },
          pgp_key: {
            type: 'string',
          },
        },
      },
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean',
          },
          nonce: {
            type: 'string',
          },
          progress: {
            type: 'integer',
            minimum: 0,
          },
          required: {
            type: 'integer',
            minimum: 1,
          },
          pgp_fingerprint: {
            type: 'string',
          },
          complete: {
            type: 'boolean',
          },
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete'],
      },
    },
  },
  generateRootCancel: {
    method: 'DELETE',
    path: '/sys/generate-root/attempt',
  },
  generateRootUpdate: {
    method: 'PUT',
    path: '/sys/generate-root/update',
    schema: {
      req: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
          },
          nonce: {
            type: 'string',
          },
        },
        required: ['key', 'nonce'],
      },
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean',
          },
          nonce: {
            type: 'string',
          },
          progress: {
            type: 'integer',
            minimum: 0,
          },
          required: {
            type: 'integer',
            minimum: 1,
          },
          pgp_fingerprint: {
            type: 'string',
          },
          complete: {
            type: 'boolean',
          },
          encoded_root_token: {
            type: 'string',
          },
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete'],
      },
    },
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
  tokenAccessors: {
    method: 'LIST',
    path: '/auth/token/accessors',
    schema: {
      res: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              keys: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['data'],
      },
    },
  },
  tokenCreate: {
    method: 'POST',
    path: '/auth/token/create',
    schema: {
      req: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          policies: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          meta: {
            type: 'object',
          },
          no_parent: {
            type: 'boolean',
          },
          no_default_policy: {
            type: 'boolean',
          },
          renewable: {
            type: 'boolean',
          },
          ttl: {
            type: 'string',
          },
          explicit_max_ttl: {
            type: 'string',
          },
          display_name: {
            type: 'string',
          },
          num_uses: {
            type: 'integer',
          },
        },
      },
      res: tokenResponse,
    },
  },
  tokenCreateOrphan: {
    method: 'POST',
    path: '/auth/token/create-orphan',
    schema: {
      req: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          policies: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          meta: {
            type: 'object',
          },
          no_parent: {
            type: 'boolean',
          },
          no_default_policy: {
            type: 'boolean',
          },
          renewable: {
            type: 'boolean',
          },
          ttl: {
            type: 'string',
          },
          explicit_max_ttl: {
            type: 'string',
          },
          display_name: {
            type: 'string',
          },
          num_uses: {
            type: 'integer',
          },
        },
      },
      res: tokenResponse,
    },
  },
  tokenCreateRole: {
    method: 'POST',
    path: '/auth/token/create/{{role_name}}',
    schema: {
      req: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          policies: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          meta: {
            type: 'object',
          },
          no_parent: {
            type: 'boolean',
          },
          no_default_policy: {
            type: 'boolean',
          },
          renewable: {
            type: 'boolean',
          },
          ttl: {
            type: 'string',
          },
          explicit_max_ttl: {
            type: 'string',
          },
          display_name: {
            type: 'string',
          },
          num_uses: {
            type: 'integer',
          },
        },
      },
      res: tokenResponse,
    },
  },
  tokenLookup: {
    method: 'POST',
    path: '/auth/token/lookup',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token'],
      },
      res: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              policies: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              path: {
                type: 'string',
              },
              meta: {
                type: 'object',
              },
              display_name: {
                type: 'string',
              },
              num_uses: {
                type: 'integer',
              },
            },
          },
        },
        required: ['data'],
      },
    },
  },
  tokenLookupAccesspr: {
    method: 'POST',
    path: '/auth/token/lookup-accessor',
    schema: {
      req: {
        type: 'object',
        properties: {
          accessor: {
            type: 'string',
          },
        },
        required: ['accessor'],
      },
      res: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              policies: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              path: {
                type: 'string',
              },
              meta: {
                type: 'object',
              },
              display_name: {
                type: 'string',
              },
              num_uses: {
                type: 'integer',
              },
            },
          },
        },
        required: ['data'],
      },
    },
  },
  tokenLookupSelf: {
    method: 'GET',
    path: '/auth/token/lookup-self',
    schema: {
      res: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              policies: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              path: {
                type: 'string',
              },
              meta: {
                type: 'object',
              },
              display_name: {
                type: 'string',
              },
              num_uses: {
                type: 'integer',
              },
            },
          },
        },
        required: ['data'],
      },
    },
  },
  tokenRenew: {
    method: 'POST',
    path: '/auth/token/renew',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
          increment: {
            type: ['integer', 'string'],
          },
        },
        required: ['token'],
      },
      res: tokenResponse,
    },
  },
  tokenRenewSelf: {
    method: 'POST',
    path: '/auth/token/renew-self',
    schema: {
      req: {
        type: 'object',
        properties: {
          increment: {
            type: ['integer', 'string'],
          },
        },
      },
      res: tokenResponse,
    },
  },
  tokenRevoke: {
    method: 'POST',
    path: '/auth/token/revoke',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token'],
      },
    },
  },
  tokenRevokeAccessor: {
    method: 'POST',
    path: '/auth/token/revoke-accessor',
    schema: {
      req: {
        type: 'object',
        properties: {
          accessor: {
            type: 'string',
          },
        },
        required: ['accessor'],
      },
    },
  },
  tokenRevokeOrphan: {
    method: 'POST',
    path: '/auth/token/revoke-orphan',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token'],
      },
    },
  },
  tokenRevokeSelf: {
    method: 'POST',
    path: '/auth/token/revoke-self',
  },
  tokenRoles: {
    method: 'GET',
    path: '/auth/token/roles?list=true',
    schema: {
      res: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              keys: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['data'],
      },
    },
  },
  addTokenRole: {
    method: 'POST',
    path: '/auth/token/roles/{{role_name}}',
    schema: {
      req: {
        type: 'object',
        properties: {
          allowed_policies: {
            type: 'string',
          },
          disallowed_policies: {
            type: 'string',
          },
          orphan: {
            type: 'boolean',
          },
          period: {
            type: 'integer',
          },
          renewable: {
            type: 'boolean',
          },
          path_suffix: {
            type: 'string',
          },
          explicit_max_ttl: {
            type: 'integer',
          },
        },
      },
    },
  },
  getTokenRole: {
    method: 'GET',
    path: '/auth/token/roles/{{role_name}}',
  },
  removeTokenRole: {
    method: 'DELETE',
    path: '/auth/token/roles/{{role_name}}',
  },
  health: {
    method: 'GET',
    path: '/sys/health',
    schema: {
      query: {
        type: 'object',
        properties: {
          standbyok: {
            type: 'boolean',
          },
          activecode: {
            type: 'integer',
          },
          standbycode: {
            type: 'integer',
          },
          sealedcode: {
            type: 'integer',
          },
          uninitcode: {
            type: 'integer',
          },
        },
      },
      res: {
        type: 'object',
        properties: {
          cluster_id: {
            type: 'string',
          },
          cluster_name: {
            type: 'string',
          },
          version: {
            type: 'string',
          },
          server_time_utc: {
            type: 'integer',
          },
          standby: {
            type: 'boolean',
          },
          sealed: {
            type: 'boolean',
          },
          initialized: {
            type: 'boolean',
          },
        },
      },
    },
  },
  leader: {
    method: 'GET',
    path: '/sys/leader',
    schema: {
      res: {
        type: 'object',
        properties: {
          ha_enabled: {
            type: 'boolean',
          },
          is_self: {
            type: 'boolean',
          },
          leader_address: {
            type: 'string',
          },
        },
      },
    },
  },
  stepDown: {
    method: 'PUT',
    path: '/sys/step-down',
  },
};
