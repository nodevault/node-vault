// token and approle response auth validation
const AUTH_SCHEME = {
  type: 'object',
  properties: {
    client_token: {
      type: 'string'
    },
    policies: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    metadata: {
      type: 'object'
    },
    lease_duration: {
      type: 'integer'
    },
    renewable: {
      type: 'boolean'
    }
  }
}

// token operation response validation
const TOKEN_RESPONSE_SCHEME = {
  type: 'object',
  properties: {
    auth: AUTH_SCHEME
  },
  required: ['auth']
}

// approle response validation
const APPROLE_RESPONSE_SCHEME = {
  type: 'object',
  properties: {
    auth: AUTH_SCHEME,
    warnings: {
      type: 'string'
    },
    wrap_info: {
      type: 'string'
    },
    data: {
      type: 'object'
    },
    lease_duration: {
      type: 'integer'
    },
    renewable: {
      type: 'boolean'
    },
    lease_id: {
      type: 'string'
    }
  }
}

// status response validation, also used in unseal
const SEAL_STATUS_RESPONSE = {
  type: 'object',
  properties: {
    sealed: {
      type: 'boolean'
    },
    t: {
      type: 'integer'
    },
    n: {
      type: 'integer'
    },
    progress: {
      type: 'integer'
    }
  },
  required: ['sealed', 't', 'n', 'progress']
}

// token creation validation
const TOKEN_CREATE_SCHEME = {
  req: {
    type: 'object',
    properties: {
      id: {
        type: 'string'
      },
      policies: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      meta: {
        type: 'object'
      },
      no_parent: {
        type: 'boolean'
      },
      no_default_policy: {
        type: 'boolean'
      },
      renewable: {
        type: 'boolean'
      },
      ttl: {
        type: 'string'
      },
      explicit_max_ttl: {
        type: 'string'
      },
      display_name: {
        type: 'string'
      },
      num_uses: {
        type: 'integer'
      }
    }
  },
  res: TOKEN_RESPONSE_SCHEME
}

// token lookup response validation
const TOKEN_LOOKUP_RESPONSE_SCHEME = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        policies: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        path: {
          type: 'string'
        },
        meta: {
          type: 'object'
        },
        display_name: {
          type: 'string'
        },
        num_uses: {
          type: 'integer'
        }
      }
    }
  },
  required: ['data']
}

// token accessors and roles validation
const TOKEN_ACCESSORS_AND_ROLES_SCHEME = {
  res: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    },
    required: ['data']
  }
}

// root operation response validation
const ROOT_RESPONSE_SCHEME = {
  type: 'object',
  properties: {
    started: {
      type: 'boolean'
    },
    nonce: {
      type: 'string'
    },
    progress: {
      type: 'integer',
      minimum: 0
    },
    required: {
      type: 'integer',
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

const features = {
  // lifecycle and status
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    description: 'Returns the seal status of the Vault. This is an unauthenticated endpoint.',
    schema: {
      res: SEAL_STATUS_RESPONSE
    }
  },
  initialized: {
    method: 'GET',
    path: '/sys/init',
    description: 'Returns the initialization status of the Vault.'
  },
  init: {
    method: 'PUT',
    path: '/sys/init',
    description: 'Initializes a new vault.',
    todo: 'path-help: POST',
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
  // seal / unseal vault
  unseal: {
    method: 'PUT',
    path: '/sys/unseal',
    description: 'Unseals the Vault.',
    schema: {
      res: SEAL_STATUS_RESPONSE
    }
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal',
    description: 'Seals the Vault.'
  },
  // root access
  generateRootStatus: {
    method: 'GET',
    path: '/sys/generate-root/attempt',
    description: 'Reads the configuration and progress of the current root generation attempt.',
    schema: {
      res: ROOT_RESPONSE_SCHEME
    }
  },
  generateRootInit: {
    method: 'PUT',
    path: '/sys/generate-root/attempt',
    todo: 'path-help: POST',
    description: 'Initializes a new root generation attempt. Only a single root generation attempt can take place at a time. One (and only one) of otp or pgp_key are required.',
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
      res: ROOT_RESPONSE_SCHEME
    }
  },
  generateRootCancel: {
    method: 'DELETE',
    path: '/sys/generate-root/attempt',
    description: 'Cancels any in-progress root generation attempt. This clears any progress made. This must be called to change the OTP or PGP key being used.'
  },
  generateRootUpdate: {
    method: 'PUT',
    path: '/sys/generate-root/update',
    todo: 'find / add documentation',
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
      res: ROOT_RESPONSE_SCHEME
    }
  },
  // mounts
  mounts: {
    method: 'GET',
    path: '/sys/mounts',
    description: 'Lists all the mounted secret backends.'
  },
  mount: {
    method: 'POST',
    path: '/sys/mounts/{{mount_point}}',
    description: 'Mount a new secret backend to the mount point in the URL.'
  },
  unmount: {
    method: 'DELETE',
    path: '/sys/mounts/{{mount_point}}',
    description: 'Unmount the specified mount point.'
  },
  remount: {
    method: 'POST',
    path: '/sys/remount',
    description: `

Changes the mount point of an already-mounted backend.

### PARAMETERS

    from (string)
        The previous mount point.

    to (string)
        The new mount point.

      `.trim()
  },
  // policies
  policies: {
    method: 'GET',
    path: '/sys/policy',
    description: 'List the names of the configured access control policies.'
  },
  getPolicy: {
    method: 'GET',
    path: '/sys/policy/{{name}}',
    description: 'Retrieve the rules for the named policy.'
  },
  addPolicy: {
    method: 'PUT',
    path: '/sys/policy/{{name}}',
    description: 'Add or update a policy.'
  },
  removePolicy: {
    method: 'DELETE',
    path: '/sys/policy/{{name}}',
    description: 'Delete the policy with the given name.'
  },
  // auths
  auths: {
    method: 'GET',
    path: '/sys/auth',
    description: 'List the currently enabled credential backends: the name, the type of the backend, and a user friendly description of the purpose for the credential backend.'
  },
  enableAuth: {
    method: 'POST',
    path: '/sys/auth/{{mount_point}}',
    description: 'Enable a new auth backend.'
  },
  disableAuth: {
    method: 'DELETE',
    path: '/sys/auth/{{mount_point}}',
    description: 'Disable the auth backend at the given mount point.'
  },
  // audits
  audits: {
    method: 'GET',
    path: '/sys/audit',
    description: 'List the currently enabled audit backends.'
  },
  enableAudit: {
    method: 'PUT',
    path: '/sys/audit/{{name}}',
    description: 'Enable an audit backend at the given path.'
  },
  disableAudit: {
    method: 'DELETE',
    path: '/sys/audit/{{name}}',
    description: 'Disable the given audit backend.'
  },
  // secret handling
  renew: {
    method: 'PUT',
    path: '/sys/leases/renew',
    description: `

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

      `.trim(),
    schema: {
      req: {
        type: 'object',
        properties: {
          lease_id: {
            type: 'string'
          },
          increment: {
            type: 'integer'
          }
        },
        required: ['lease_id']
      },
      res: {
        type: 'object',
        properties: {
          lease_id: {
            type: 'string'
          },
          renewable: {
            type: 'boolean'
          },
          lease_duration: {
            type: 'integer'
          }
        }
      }
    }
  },
  revoke: {
    method: 'PUT',
    path: '/sys/leases/revoke',
    description: `

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

      `.trim(),
    schema: {
      req: {
        type: 'object',
        properties: {
          lease_id: {
            type: 'string'
          }
        },
        required: ['lease_id']
      }
    }
  },
  revokePrefix: {
    method: 'PUT',
    path: '/sys/revoke-prefix/{{path_prefix}}',
    todo: 'find / create documentation'
  },
  rotate: {
    method: 'PUT',
    path: '/sys/rotate',
    description: `

Rotates the backend encryption key used to persist data.


### DESCRIPTION

Rotate generates a new encryption key which is used to encrypt all
data going to the storage backend. The old encryption keys are kept so
that data encrypted using those keys can still be decrypted.

      `.trim()
  },
  unwrap: {
    method: 'POST',
    path: '/sys/wrapping/unwrap',
    description: `

Unwraps a response-wrapped token.

### PARAMETERS

    token (string)
        The unwrap token.

### DESCRIPTION

Unwraps a response-wrapped token. Unlike simply reading from cubbyhole/response,
this provides additional validation on the token, and rather than a JSON-escaped
string, the returned response is the exact same as the contained wrapped response.

      `.trim(),
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        }
      }
    }
  },
  // token management
  // - ancestors
  tokenAccessors: {
    method: 'LIST',
    path: '/auth/token/accessors',
    schema: TOKEN_ACCESSORS_AND_ROLES_SCHEME
  },
  // - creation
  tokenCreate: {
    method: 'POST',
    path: '/auth/token/create',
    schema: TOKEN_CREATE_SCHEME
  },
  tokenCreateOrphan: {
    method: 'POST',
    path: '/auth/token/create-orphan',
    schema: TOKEN_CREATE_SCHEME
  },
  tokenCreateRole: {
    method: 'POST',
    path: '/auth/token/create/{{role_name}}',
    schema: TOKEN_CREATE_SCHEME
  },
  // - lookup
  tokenLookup: {
    method: 'POST',
    path: '/auth/token/lookup',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token']
      },
      res: TOKEN_LOOKUP_RESPONSE_SCHEME
    }
  },
  tokenLookupAccessor: {
    method: 'POST',
    path: '/auth/token/lookup-accessor',
    schema: {
      req: {
        type: 'object',
        properties: {
          accessor: {
            type: 'string'
          }
        },
        required: ['accessor']
      },
      res: TOKEN_LOOKUP_RESPONSE_SCHEME
    }
  },
  tokenLookupSelf: {
    method: 'GET',
    path: '/auth/token/lookup-self',
    schema: { res: TOKEN_LOOKUP_RESPONSE_SCHEME }
  },
  // - renewal
  tokenRenew: {
    method: 'POST',
    path: '/auth/token/renew',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          },
          increment: {
            type: ['integer', 'string']
          }
        },
        required: ['token']
      },
      res: TOKEN_RESPONSE_SCHEME
    }
  },
  tokenRenewSelf: {
    method: 'POST',
    path: '/auth/token/renew-self',
    schema: {
      req: {
        type: 'object',
        properties: {
          increment: {
            type: ['integer', 'string']
          }
        }
      },
      res: TOKEN_RESPONSE_SCHEME
    }
  },
  // - revocation
  tokenRevoke: {
    method: 'POST',
    path: '/auth/token/revoke',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token']
      }
    }
  },
  tokenRevokeAccessor: {
    method: 'POST',
    path: '/auth/token/revoke-accessor',
    schema: {
      req: {
        type: 'object',
        properties: {
          accessor: {
            type: 'string'
          }
        },
        required: ['accessor']
      }
    }
  },
  tokenRevokeOrphan: {
    method: 'POST',
    path: '/auth/token/revoke-orphan',
    schema: {
      req: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token']
      }
    }
  },
  tokenRevokeSelf: {
    method: 'POST',
    path: '/auth/token/revoke-self'
  },
  // - roles
  tokenRoles: {
    method: 'GET',
    path: '/auth/token/roles?list=true',
    schema: TOKEN_ACCESSORS_AND_ROLES_SCHEME
  },
  addTokenRole: {
    method: 'POST',
    path: '/auth/token/roles/{{role_name}}',
    schema: {
      req: {
        type: 'object',
        properties: {
          allowed_policies: {
            type: 'string'
          },
          disallowed_policies: {
            type: 'string'
          },
          orphan: {
            type: 'boolean'
          },
          period: {
            type: 'integer'
          },
          renewable: {
            type: 'boolean'
          },
          path_suffix: {
            type: 'string'
          },
          explicit_max_ttl: {
            type: 'integer'
          }
        }
      }
    }
  },
  getTokenRole: {
    method: 'GET',
    path: '/auth/token/roles/{{role_name}}'
  },
  removeTokenRole: {
    method: 'DELETE',
    path: '/auth/token/roles/{{role_name}}'
  },
  approleRoles: {
    method: 'LIST',
    path: '/auth/{{mount_point=approle}}/role',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  // - approle
  addApproleRole: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}/role/{{role_name}}',
    schema: {
      req: {
        bind_secret_id: {
          type: 'boolean'
        },
        bound_cidr_list: {
          type: 'string'
        },
        policies: {
          type: 'string'
        },
        secret_id_num_uses: {
          type: 'integer'
        },
        secret_id_ttl: {
          type: 'integer'
        },
        token_num_uses: {
          type: 'integer'
        },
        token_ttl: {
          type: 'integer'
        },
        token_max_ttl: {
          type: 'integer'
        },
        period: {
          type: 'integer'
        }
      }
    }
  },
  getApproleRole: {
    method: 'GET',
    path: '/auth/{{mount_point=approle}}/role/{{role_name}}',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  deleteApproleRole: {
    method: 'DELETE',
    path: '/auth/{{mount_point=approle}}/role/{{role_name}}'
  },
  getApproleRoleId: {
    method: 'GET',
    path: '/auth/{{mount_point=approle}}/role/{{role_name}}/role-id',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  updateApproleRoleId: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}/role/{{role_name}}/role-id',
    schema: {
      req: {
        type: 'object',
        properties: {
          role_id: {
            type: 'string'
          }
        },
        required: ['role_id']
      }
    }
  },
  getApproleRoleSecret: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id',
    schema: {
      req: {
        type: 'object',
        properties: {
          metadata: {
            type: 'string'
          },
          cidr_list: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  approleSecretAccessors: {
    method: 'LIST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  approleSecretLookup: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id/lookup',
    schema: {
      req: {
        type: 'object',
        properties: {
          secret_id: {
            type: 'string'
          }
        },
        required: ['secret_id']
      },
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  approleSecretDestroy: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id/destroy',
    schema: {
      req: {
        type: 'object',
        properties: {
          secret_id: {
            type: 'string'
          }
        },
        required: ['secret_id']
      }
    }
  },
  approleSecretAccessorLookup: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id-accessor/lookup',
    schema: {
      req: {
        type: 'object',
        properties: {
          secret_id: {
            type: 'string'
          }
        },
        required: ['secret_id']
      }
    }
  },
  approleSecretAccessorDestroy: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}' +
      '/role/{{role_name}}/secret-id-accessor/destroy'
  },
  approleLogin: {
    method: 'POST',
    path: '/auth/{{mount_point=approle}}/login',
    schema: {
      req: {
        type: 'object',
        properties: {
          role_id: {
            type: 'string'
          },
          secret_id: {
            type: 'string'
          }
        },
        required: ['role_id', 'secret_id']
      },
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  // utils
  health: {
    method: 'GET',
    path: '/sys/health',
    schema: {
      query: {
        type: 'object',
        properties: {
          standbyok: {
            type: 'boolean'
          },
          activecode: {
            type: 'integer'
          },
          standbycode: {
            type: 'integer'
          },
          sealedcode: {
            type: 'integer'
          },
          uninitcode: {
            type: 'integer'
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
            type: 'integer'
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
}

// adds a standard third party login feature
const addAuthLogin = (name) => (features[`${name}Login`] = {
  method: 'POST',
  path: `/auth/{{mount_point=${name}}}/login/{{username}}`,
  schema: {
    req: {
      type: 'object',
      properties: {
        password: {
          type: 'string'
        }
      },
      required: ['password']
    },
    res: TOKEN_RESPONSE_SCHEME
  }
})

// add all third party logins
const authLogins = [
  'github',
  'userpass',
  'ldap',
  'okta',
  'radius']
authLogins.forEach(addAuthLogin)

console.log(features.githubLogin)

module.exports = features
