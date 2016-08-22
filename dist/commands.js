'use strict';

module.exports = {
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    schema: {
      res: {
        type: 'object',
        properties: {
          sealed: {
            type: 'boolean'
          },
          t: {
            type: 'number'
          },
          n: {
            type: 'number'
          },
          progress: {
            type: 'number'
          }
        },
        required: ['sealed', 't', 'n', 'progress']
      }
    }
  },
  initialized: {
    method: 'GET',
    path: '/sys/init'
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
            minimum: 1
          },
          secret_threshold: {
            type: 'integer',
            minimum: 1
          },
          pgp_keys: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          }
        },
        required: ['secret_shares', 'secret_threshold']
      },
      res: {
        type: 'object',
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          },
          root_token: {
            type: 'string'
          }
        },
        required: ['keys', 'root_token']
      }
    }
  },
  generateRootStatus: {
    method: 'GET',
    path: '/sys/generate-root/attempt',
    schema: {
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean'
          },
          nonce: {
            type: 'string'
          },
          progress: {
            type: 'number',
            minimum: 0
          },
          required: {
            type: 'number',
            minimum: 1
          },
          pgp_fingerprint: {
            type: 'string'
          },
          complete: {
            type: 'boolean'
          }
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete']
      }
    }
  },
  generateRootInit: {
    method: 'PUT',
    path: '/sys/generate-root/attempt',
    schema: {
      req: {
        type: 'object',
        properties: {
          otp: {
            type: 'string'
          },
          pgp_key: {
            type: 'string'
          }
        }
      },
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean'
          },
          nonce: {
            type: 'string'
          },
          progress: {
            type: 'number',
            minimum: 0
          },
          required: {
            type: 'number',
            minimum: 1
          },
          pgp_fingerprint: {
            type: 'string'
          },
          complete: {
            type: 'boolean'
          }
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete']
      }
    }
  },
  generateRootCancel: {
    method: 'DELETE',
    path: '/sys/generate-root/attempt'
  },
  generateRootUpdate: {
    method: 'PUT',
    path: '/sys/generate-root/update',
    schema: {
      req: {
        type: 'object',
        properties: {
          key: {
            type: 'string'
          },
          nonce: {
            type: 'string'
          }
        },
        required: ['key', 'nonce']
      },
      res: {
        type: 'object',
        properties: {
          started: {
            type: 'boolean'
          },
          nonce: {
            type: 'string'
          },
          progress: {
            type: 'number',
            minimum: 0
          },
          required: {
            type: 'number',
            minimum: 1
          },
          pgp_fingerprint: {
            type: 'string'
          },
          complete: {
            type: 'boolean'
          },
          encoded_root_token: {
            type: 'string'
          }
        },
        required: ['started', 'nonce', 'progress', 'required', 'pgp_fingerprint', 'complete']
      }
    }
  },
  unseal: {
    method: 'PUT',
    path: '/sys/unseal'
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal'
  },
  mounts: {
    method: 'GET',
    path: '/sys/mounts'
  },
  mount: {
    method: 'POST',
    path: '/sys/mounts/{{mount_point}}'
  },
  unmount: {
    method: 'DELETE',
    path: '/sys/mounts/{{mount_point}}'
  },
  remount: {
    method: 'POST',
    path: '/sys/remount'
  },
  policies: {
    method: 'GET',
    path: '/sys/policy'
  },
  addPolicy: {
    method: 'PUT',
    path: '/sys/policy/{{name}}'
  },
  getPolicy: {
    method: 'GET',
    path: '/sys/policy/{{name}}'
  },
  removePolicy: {
    method: 'DELETE',
    path: '/sys/policy/{{name}}'
  },
  auths: {
    method: 'GET',
    path: '/sys/auth'
  },
  enableAuth: {
    method: 'POST',
    path: '/sys/auth/{{mount_point}}'
  },
  disableAuth: {
    method: 'DELETE',
    path: '/sys/auth/{{mount_point}}'
  },
  audits: {
    method: 'GET',
    path: '/sys/audit'
  },
  enableAudit: {
    method: 'PUT',
    path: '/sys/audit/{{name}}'
  },
  disableAudit: {
    method: 'DELETE',
    path: '/sys/audit/{{name}}'
  },
  renew: {
    method: 'PUT',
    path: '/sys/renew/{{lease_id}}'
  },
  revoke: {
    method: 'PUT',
    path: '/sys/revoke/{{lease_id}}'
  },
  revokePrefix: {
    method: 'PUT',
    path: '/sys/revoke-prefix/{{path_prefix}}'
  },
  rotate: {
    method: 'PUT',
    path: '/sys/rotate'
  },
  githubLogin: {
    method: 'POST',
    path: '/auth/github/login'
  },
  userpassLogin: {
    method: 'POST',
    path: '/auth/userpass/login/{{username}}'
  },
  health: {
    method: 'GET',
    path: '/sys/health',
    schema: {
      req: {
        type: 'object',
        properties: {
          standbyok: {
            type: 'boolean'
          },
          activecode: {
            type: 'number'
          },
          standbycode: {
            type: 'number'
          },
          sealedcode: {
            type: 'number'
          },
          uninitcode: {
            type: 'number'
          }
        }
      },
      res: {
        type: 'object',
        properties: {
          cluster_id: {
            type: 'string'
          },
          cluster_name: {
            type: 'string'
          },
          version: {
            type: 'string'
          },
          server_time_utc: {
            type: 'number'
          },
          standby: {
            type: 'boolean'
          },
          sealed: {
            type: 'boolean'
          },
          initialized: {
            type: 'boolean'
          }
        }
      }
    }
  },
  leader: {
    method: 'GET',
    path: '/sys/leader',
    schema: {
      res: {
        type: 'object',
        properties: {
          ha_enabled: {
            type: 'boolean'
          },
          is_self: {
            type: 'boolean'
          },
          leader_address: {
            type: 'string'
          }
        }
      }
    }
  },
  stepDown: {
    method: 'PUT',
    path: '/sys/step-down'
  }
};