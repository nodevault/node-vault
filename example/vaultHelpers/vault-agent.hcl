pid_file = "./pidfile"
vault {
  address = "http://vault:8200"
  retry {
    num_retries = 5
  }
}
auto_auth {
  method {
    type = "approle"
    config = {
      role_id_file_path = "/helpers/role_id"
      secret_id_file_path = "/helpers/secret_id"
      remove_secret_id_file_after_reading = false
    }
  }
  sink "file" {
    config = {
      path = "/helpers/sink_file"
    }
  }
}
cache {
  use_auto_auth_token = true
}
listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = true
}
