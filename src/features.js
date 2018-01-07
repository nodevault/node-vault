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

const TOKEN_RESPONSE_SCHEME = {
  type: 'object',
  properties: {
    auth: AUTH_SCHEME
  },
  required: ['auth']
}

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

module.exports = {
  status: {
    method: 'GET',
    path: '/sys/seal-status',
    schema: {
      res: SEAL_STATUS_RESPONSE
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
  unseal: {
    method: 'PUT',
    path: '/sys/unseal',
    schema: {
      res: SEAL_STATUS_RESPONSE
    }
  },
  seal: {
    method: 'PUT',
    path: '/sys/seal'
  },
  generateRootStatus: {
    method: 'GET',
    path: '/sys/generate-root/attempt',
    schema: {
      res: ROOT_RESPONSE_SCHEME
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
      res: ROOT_RESPONSE_SCHEME
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
      res: ROOT_RESPONSE_SCHEME
    }
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
    path: '/sys/leases/renew',
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
    path: '/sys/revoke-prefix/{{path_prefix}}'
  },
  rotate: {
    method: 'PUT',
    path: '/sys/rotate'
  },
  unwrap: {
    method: 'POST',
    path: '/sys/wrapping/unwrap',
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
  githubLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}github{{/mount_point}}/login',
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
      res: TOKEN_RESPONSE_SCHEME
    }
  },
  userpassLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}userpass{{/mount_point}}/login/{{username}}',
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
  },
  ldapLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}ldap{{/mount_point}}/login/{{username}}',
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
  },
  oktaLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}okta{{/mount_point}}/login/{{username}}',
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
  },
  radiusLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}radius{{/mount_point}}/login/{{username}}',
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
  },
  tokenAccessors: {
    method: 'LIST',
    path: '/auth/token/accessors',
    schema: TOKEN_ACCESSORS_AND_ROLES_SCHEME
  },
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  addApproleRole: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}',
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  deleteApproleRole: {
    method: 'DELETE',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}'
  },
  getApproleRoleId: {
    method: 'GET',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/role-id',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  updateApproleRoleId: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/role/{{role_name}}/role-id',
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
      '/role/{{role_name}}/secret-id',
    schema: {
      res: APPROLE_RESPONSE_SCHEME
    }
  },
  approleSecretLookup: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
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
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}' +
      '/role/{{role_name}}/secret-id-accessor/destroy'
  },
  approleLogin: {
    method: 'POST',
    path: '/auth/{{mount_point}}{{^mount_point}}approle{{/mount_point}}/login',
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
