---
title: Production Secret Management with Vault
---

## Overview

HashiCorp Vault provides secure, centralized secret management for the K3s
cluster. This setup uses Vault in High Availability (HA) mode with Raft storage
backend and the Vault Secrets Operator to automatically sync secrets from Vault
into Kubernetes.

### How It Works

1. **Vault** acts as a centralized, secure database for secrets
2. The **Vault Secrets Operator** runs in the cluster and watches for
   `VaultSecret` resources
3. When a `VaultSecret` is applied, the operator securely authenticates to
   Vault, fetches the specified data, and creates a regular Kubernetes `Secret`
4. Applications use the Kubernetes `Secret` as normal

This keeps actual secrets safe in Vault, while your Git repository only contains
non-sensitive instructions for how to retrieve them.

## Part 1: Install Vault in HA Mode

For production environments, Vault is installed in High Availability mode using
its integrated Raft storage backend.

### Add HashiCorp Helm Repository

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
```

### Install Vault in HA Mode

```bash
helm install vault hashicorp/vault \
  --namespace vault \
  --create-namespace \
  --set "server.ha.enabled=true" \
  --set "server.ha.raft.enabled=true"
```

This creates a Vault cluster with:

- Multiple Vault pods for high availability
- Raft storage backend for data persistence
- Automatic leader election

### Verify Installation

```bash
kubectl get pods -n vault
```

Wait for all Vault pods to be in `Running` state.

## Part 2: Initialize and Unseal Vault

A production Vault starts "sealed" for security. You must initialize it to get
the master keys and then unseal it.

### Initialize Vault

1. **Exec into the first Vault pod:**

```bash
kubectl exec -it -n vault vault-0 -- /bin/sh
```

2. **Initialize Vault:**

```sh
vault operator init
```

This command outputs:

- **5 Unseal Keys** - You need 3 of these to unseal Vault
- **1 Initial Root Token** - Used for initial authentication

**⚠️ CRITICAL: Save all of this information securely (password manager, secure
storage). This is the only time you'll see the unseal keys and root token in
plain text.**

### Unseal Vault

Vault requires 3 out of 5 unseal keys to become operational. Run the unseal
command three times, each time with a different key:

```sh
vault operator unseal <UNSEAL_KEY_1>
vault operator unseal <UNSEAL_KEY_2>
vault operator unseal <UNSEAL_KEY_3>
```

After the third key is entered, Vault will be unsealed. You can verify with:

```sh
vault status
```

You should see `Sealed: false`.

Type `exit` to leave the pod shell.

### Unseal Additional Vault Pods

If you have multiple Vault pods (HA mode), you need to unseal each one:

```bash
# Unseal vault-1
kubectl exec -it -n vault vault-1 -- vault operator unseal <UNSEAL_KEY_1>
kubectl exec -it -n vault vault-1 -- vault operator unseal <UNSEAL_KEY_2>
kubectl exec -it -n vault vault-1 -- vault operator unseal <UNSEAL_KEY_3>

# Unseal vault-2 (if exists)
kubectl exec -it -n vault vault-2 -- vault operator unseal <UNSEAL_KEY_1>
kubectl exec -it -n vault vault-2 -- vault operator unseal <UNSEAL_KEY_2>
kubectl exec -it -n vault vault-2 -- vault operator unseal <UNSEAL_KEY_3>
```

## Part 3: Install the Vault Secrets Operator

The Vault Secrets Operator is the bridge between your cluster and Vault,
automatically syncing secrets.

### Install the Operator

```bash
helm install vault-secrets-operator hashicorp/vault-secrets-operator \
  --namespace vault-secrets-operator \
  --create-namespace
```

### Verify Installation

```bash
kubectl get pods -n vault-secrets-operator
```

Wait for the operator pod to be in `Running` state.

## Part 4: Configure Vault for Kubernetes Authentication

Configure Vault to trust your Kubernetes cluster and allow the operator to fetch
secrets.

### Connect to Vault and Log In

```bash
kubectl exec -it -n vault vault-0 -- /bin/sh
vault login <YOUR_INITIAL_ROOT_TOKEN>
```

### Enable Secrets Engine and Kubernetes Auth

```sh
# Enable the KVv2 secrets engine at the path "secret/"
vault secrets enable -path=secret kv-v2

# Enable the Kubernetes auth method
vault auth enable kubernetes

# Configure the auth method with cluster details
vault write auth/kubernetes/config \
  token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  kubernetes_host="https://kubernetes.default.svc" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
```

### Create Policies

Policies define what secrets can be accessed. Create a policy for Longhorn R2
secrets:

```sh
vault policy write longhorn-r2-policy - <<EOF
path "secret/data/longhorn-r2" {
  capabilities = ["read"]
}
EOF
```

For ArgoCD secrets:

```sh
vault policy write argocd-secrets-reader - <<EOF
path "secret/data/argocd/*" {
  capabilities = ["read"]
}
EOF
```

### Create Authentication Roles

Roles link policies to Kubernetes service accounts. Create a role for Longhorn:

```sh
vault write auth/kubernetes/role/longhorn-role \
  bound_service_account_names=default \
  bound_service_account_namespaces=longhorn-system \
  policies=longhorn-r2-policy \
  ttl=24h
```

Create a role for ArgoCD:

```sh
vault write auth/kubernetes/role/argocd \
  bound_service_account_names=argocd-repo-server \
  bound_service_account_namespaces=argocd \
  policies=argocd-secrets-reader \
  ttl=24h
```

Type `exit` to leave the pod shell.

## Part 5: Store Secrets in Vault

### Store Secrets via CLI

Connect to Vault pod and store your secrets:

```bash
kubectl exec -it -n vault vault-0 -- /bin/sh
vault login <YOUR_ROOT_TOKEN>
```

Store Longhorn R2 credentials:

```sh
vault kv put secret/longhorn-r2 \
  AWS_ACCESS_KEY_ID="YOUR_R2_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="YOUR_R2_SECRET_ACCESS_KEY" \
  AWS_ENDPOINTS="https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com"
```

Type `exit` to leave the pod shell.

### Store Secrets via Web UI

1. **Port-forward to Vault UI:**

```bash
kubectl port-forward -n vault svc/vault 8200:8200
```

2. **Open browser:** Navigate to `http://127.0.0.1:8200`

3. **Log in:** Choose **Token** method and paste your root token

4. **Navigate to Secrets:** Go to `secret/` → `longhorn-r2`

5. **Create secret:** Click "Create secret" and add your key-value pairs

## Part 6: Sync Secrets with Vault Secrets Operator

The Vault Secrets Operator uses `VaultSecret` resources to sync secrets from
Vault into Kubernetes.

### VaultConnection Resource

First, create a connection to Vault (`k3s-vault/vault-connection.yaml`):

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultConnection
metadata:
  name: vault-connection
  namespace: longhorn-system
spec:
  address: http://vault.vault:8200
  skipTLSVerify: true
```

Apply it:

```bash
kubectl apply -f k3s-vault/vault-connection.yaml
```

### VaultAuth Resource

Create the authentication configuration (`k3s-vault/vault-auth.yaml`):

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultAuth
metadata:
  name: vault-auth-kubernetes
  namespace: longhorn-system
spec:
  vaultConnectionRef: vault-connection
  method: kubernetes
  mount: kubernetes
  kubernetes:
    role: longhorn-role
    serviceAccount: default
```

Apply it:

```bash
kubectl apply -f k3s-vault/vault-auth.yaml
```

### VaultSecret Resource

Create the `VaultSecret` resource (`k3s-vault/longhorn-r2-vault-secret.yaml`):

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultSecret
metadata:
  name: longhorn-r2-secret-from-vault
  namespace: longhorn-system
spec:
  vault:
    address: http://vault.vault:8200
    auth:
      kubernetes:
        role: 'longhorn-role'
        mountPath: 'kubernetes'
  target:
    name: r2-longhorn-secret
    template:
      type: Opaque
      stringData:
        AWS_ACCESS_KEY_ID: '{{ .AWS_ACCESS_KEY_ID }}'
        AWS_SECRET_ACCESS_KEY: '{{ .AWS_SECRET_ACCESS_KEY }}'
        AWS_ENDPOINTS: '{{ .AWS_ENDPOINTS }}'
  source:
    kv:
      path: 'secret/longhorn-r2'
      version: '2'
```

Apply it:

```bash
kubectl apply -f k3s-vault/longhorn-r2-vault-secret.yaml
```

### Verify Secret Creation

Check that the operator created the Kubernetes secret:

```bash
kubectl get secret r2-longhorn-secret -n longhorn-system
kubectl get vaultsecret -n longhorn-system
```

The operator should show `Status: Valid` and the Kubernetes secret should exist.

## Accessing the Vault Web UI

Vault has a powerful built-in web UI perfect for day-to-day operations.

### Port-Forward to Vault

```bash
kubectl port-forward -n vault svc/vault 8200:8200
```

Leave this terminal running.

### Open the UI

Navigate to `http://127.0.0.1:8200` in your browser.

### Log In

1. Choose **Token** as the login method
2. Paste your **Initial Root Token** (saved during initialization)
3. Click **Sign in**

You can now:

- Browse and edit secrets visually
- Create new policies
- Manage authentication roles
- View audit logs
- Monitor Vault health

## Best Practices

### Secret Rotation

Regularly rotate secrets stored in Vault:

1. **Update secret in Vault:**

   ```bash
   kubectl exec -it -n vault vault-0 -- /bin/sh
   vault login <TOKEN>
   vault kv put secret/longhorn-r2 \
     AWS_ACCESS_KEY_ID="NEW_KEY" \
     AWS_SECRET_ACCESS_KEY="NEW_SECRET"
   ```

2. **Vault Secrets Operator automatically syncs** the updated secret to
   Kubernetes

### Policy Management

- **Principle of Least Privilege:** Only grant read access to specific paths
- **Separate Policies:** Create separate policies for different applications
- **Regular Audits:** Review policies periodically

### Token Management

- **Avoid Root Token:** Create admin tokens with limited scope for daily use
- **Token Rotation:** Regularly rotate tokens
- **Short TTLs:** Use short TTLs for service account tokens (e.g., 24h)

### Namespace Isolation

Create separate VaultAuth resources for different namespaces to ensure proper
isolation:

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultAuth
metadata:
  name: myapp-auth
  namespace: myapp
spec:
  vaultConnectionRef: vault-connection
  method: kubernetes
  mount: kubernetes
  kubernetes:
    role: myapp-role
    serviceAccount: myapp-sa
```

## Troubleshooting

### Vault is Sealed

If Vault becomes sealed (e.g., after a restart), unseal it:

```bash
kubectl exec -it -n vault vault-0 -- /bin/sh
vault operator unseal <UNSEAL_KEY_1>
vault operator unseal <UNSEAL_KEY_2>
vault operator unseal <UNSEAL_KEY_3>
```

### VaultSecret Not Syncing

1. **Check VaultSecret status:**

   ```bash
   kubectl describe vaultsecret <name> -n <namespace>
   ```

2. **Check operator logs:**

   ```bash
   kubectl logs -n vault-secrets-operator deployment/vault-secrets-operator
   ```

3. **Verify Vault connection:**

   ```bash
   kubectl get vaultconnection -n <namespace>
   ```

4. **Check authentication:**
   ```bash
   kubectl get vaultauth -n <namespace>
   ```

### Authentication Failures

1. **Verify role exists:**

   ```bash
   kubectl exec -it -n vault vault-0 -- vault read auth/kubernetes/role/<role-name>
   ```

2. **Check service account:**

   ```bash
   kubectl get serviceaccount -n <namespace>
   ```

3. **Verify policy:**
   ```bash
   kubectl exec -it -n vault vault-0 -- vault policy read <policy-name>
   ```

### Secret Not Found

1. **Verify secret exists in Vault:**

   ```bash
   kubectl exec -it -n vault vault-0 -- vault kv get secret/longhorn-r2
   ```

2. **Check path in VaultSecret:**
   ```bash
   kubectl get vaultsecret <name> -n <namespace> -o yaml
   ```

## Verification Commands

### Check Vault Status

```bash
kubectl exec -it -n vault vault-0 -- vault status
```

### List Secrets in Vault

```bash
kubectl exec -it -n vault vault-0 -- vault kv list secret/
```

### Check Vault Secrets Operator

```bash
kubectl get pods -n vault-secrets-operator
kubectl get vaultsecrets -A
```

### Verify Synced Secrets

```bash
kubectl get secrets -n longhorn-system | grep r2
```

## References

- **Vault configuration**: `K3S/k3s-vault/`
- **Vault documentation**: https://developer.hashicorp.com/vault/docs
- **Vault Secrets Operator**: https://secrets-store-csi-driver.sigs.k8s.io/
