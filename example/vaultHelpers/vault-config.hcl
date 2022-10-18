storage "file" {
    # this path is used so that volume can be enabled https://hub.docker.com/_/vault
    path = "/vault/file"
}

listener "tcp" {
    address     = "0.0.0.0:8300"
    tls_disable = "true"
}

api_addr = "http://127.0.0.1:8300"
cluster_addr = "https://127.0.0.1:8201"
ui = true
