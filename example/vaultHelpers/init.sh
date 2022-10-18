apk add jq curl
export VAULT_ADDR=http://localhost:8200
root_token=$(cat /helpers/keys.json | jq -r '.root_token')
unseal_vault() {
export VAULT_TOKEN=$root_token
vault operator unseal -address=${VAULT_ADDR} $(cat /helpers/keys.json | jq -r '.keys[0]')
vault login token=$VAULT_TOKEN
}
if [[ -n "$root_token" ]]
then
  echo "Vault already initialized"
  unseal_vault
else
  echo "Vault not initialized"
  curl --request POST --data '{"secret_shares": 1, "secret_threshold": 1}' http://127.0.0.1:8200/v1/sys/init > /helpers/keys.json
  root_token=$(cat /helpers/keys.json | jq -r '.root_token')

  unseal_vault

  vault secrets enable -version=2 kv
  vault auth enable approle
  vault policy write admin-policy /helpers/admin-policy.hcl
  vault write auth/approle/role/dev-role token_policies="admin-policy"
  vault read -format=json auth/approle/role/dev-role/role-id \
    | jq -r '.data.role_id' > /helpers/role_id
  vault write -format=json -f auth/approle/role/dev-role/secret-id \
    | jq -r '.data.secret_id' > /helpers/secret_id
fi
printf "\n\nVAULT_TOKEN=%s\n\n" $VAULT_TOKEN
