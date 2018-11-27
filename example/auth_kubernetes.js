// file: example/kubernetes.js

process.env.DEBUG = 'node-vault'; // switch on debug mode
const vault = require('./../src/index')();

const vaultServicAccountSecretToken = process.env.VAULT_SVC_ACCT_SECRET_TOKEN || 'vault-k8s-token';
const kubernetesHostUrl = process.env.K8S_HOST_URL || 'https://k8s.example.com:6443';
const kubernetesCaCert = process.env.K8S_CA_CERT || 'k8s-ca-certificate-data';

const appName = process.env.APP_NAME || 'some-app';
const appServiceAccountSecretToken = process.env.APP_SVC_ACCT_SECRET_TOKEN || 'app-k8s-token';

vault.auths()
.then((result) => {
  if (result.hasOwnProperty('kubernetes/')) return undefined;
  return vault.enableAuth({
    mount_point: 'kubernetes',
    type: 'kubernetes',
    description: 'Kubernetes auth',
  });
})
.then(() => vault.write('auth/kubernetes/config', {
  token_reviewer_jwt: vaultServicAccountSecretToken,
  kubernetes_host: kubernetesHostUrl,
  kubernetes_ca_cert: kubernetesCaCert,
}))
.then(() => vault.addPolicy({
  name: appName,
  rules: `path "secret/${appName}/*" { capabilities = ["read"] }`,
}))
.then(() => vault.write(`auth/kubernetes/role/${appName}`, {
  bound_service_account_names: appName,
  bound_service_account_namespaces: 'default',
  policies: appName,
  ttl: '1h',
}))
.then(() => vault.kubernetesLogin({ role: appName, jwt: appServiceAccountSecretToken }))
.then(console.log)
.catch((err) => console.error(err.message));
