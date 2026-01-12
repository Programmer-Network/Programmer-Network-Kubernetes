---
title: GitOps with ArgoCD
---

## Overview

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. This
cluster uses ArgoCD to manage all applications through Git-based configuration,
ensuring infrastructure-as-code principles and automated synchronization.

## Installation

ArgoCD is installed using Helm with custom values that integrate with Vault for
secret management and Traefik for ingress.

### Prerequisites

- k3s cluster running
- cert-manager installed (for TLS certificates)
- Traefik ingress controller (default in k3s)
- HashiCorp Vault configured (for secret management)

### Install ArgoCD

```bash
# Add the Argo CD Helm repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Create namespace
kubectl create namespace argocd

# Install Argo CD with custom values
helm install argocd argo/argo-cd \
  --namespace argocd \
  --values k3s-argocd/values.yaml
```

The custom `values.yaml` configures:

- Vault integration via ArgoCD Vault Plugin (AVP)
- Vault agent sidecar for token management
- Repository server configuration for secret injection

## Configuration

### Insecure Mode with TLS Termination

ArgoCD is configured to run in insecure (HTTP) mode internally, with TLS
termination handled by Traefik at the ingress level. This is a common pattern
that simplifies certificate management.

**ConfigMap** (`k3s-argocd/argocd-config-map.yaml`):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  server.insecure: 'true'
```

Apply the config:

```bash
kubectl apply -f k3s-argocd/argocd-config-map.yaml
kubectl rollout restart deployment argocd-server -n argocd
```

### TLS Certificate with cert-manager

ArgoCD uses cert-manager to automatically provision Let's Encrypt certificates
via DNS-01 challenge with Cloudflare.

**ClusterIssuer** (`k3s-argocd/clusterissuer.yaml`):

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-dns01
spec:
  acme:
    email: your-email@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-dns01-account-key
    solvers:
      - dns01:
          cloudflare:
            email: your-email@example.com
            apiTokenSecretRef:
              name: cloudflare-api-token-secret
              key: api-token
```

**Certificate** (`k3s-argocd/argocd-certificate.yaml`):

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: argocd-tls
  namespace: argocd
spec:
  secretName: argocd-server-tls
  issuerRef:
    name: letsencrypt-dns01
    kind: ClusterIssuer
  dnsNames:
    - argocd.yourdomain.com
```

Replace `argocd.yourdomain.com` with your actual ArgoCD domain.

**Cloudflare API Token Secret:**

```bash
kubectl create secret generic cloudflare-api-token-secret \
  --from-literal=api-token=<YOUR_CLOUDFLARE_API_TOKEN> \
  -n cert-manager
```

Apply the certificate:

```bash
kubectl apply -f k3s-argocd/clusterissuer.yaml
kubectl apply -f k3s-argocd/argocd-certificate.yaml
```

### Ingress Configuration

The ingress resource (`k3s-argocd/argocd-ingress.yaml`) exposes ArgoCD through
Traefik with TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-dns01'
    traefik.ingress.kubernetes.io/router.entrypoints: 'websecure'
    traefik.ingress.kubernetes.io/router.tls: 'true'
spec:
  ingressClassName: traefik
  rules:
    - host: argocd.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
  tls:
    - hosts:
        - argocd.yourdomain.com
      secretName: argocd-server-tls
```

Replace `argocd.yourdomain.com` with your actual ArgoCD domain.

Apply the ingress:

```bash
kubectl apply -f k3s-argocd/argocd-ingress.yaml
```

### Verify Certificate Status

```bash
kubectl describe certificate argocd-tls -n argocd
```

## App-of-Apps Pattern

This cluster uses the App-of-Apps pattern to manage all applications
declaratively through Git. The root applications manage child applications,
creating a hierarchical structure.

### Root Applications

Two root applications manage the entire application landscape:

1. **Root App** (`k3s-argocd-app-of-apps/root-app.yaml`) - Manages application
   deployments
2. **Root Projects App** (`k3s-argocd-app-of-apps/root-projects-app.yaml`) -
   Manages ArgoCD projects

**Root App:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/argocd-app-of-apps.git
    targetRevision: main
    path: apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      selfHeal: true
```

**Root Projects App:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-projects-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/argocd-app-of-apps.git
    targetRevision: main
    path: projects
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Replace `your-org/argocd-app-of-apps` with your actual Git repository.

### Application Structure

The root app manages applications defined in your Git repository (from
`k3s-argocd-app-of-apps/apps/`). Examples of common applications you might
manage:

- **longhorn** - Distributed block storage
- **cloudnative-pg-operator** - PostgreSQL operator
- **redis** - Redis deployment
- **monitoring** - Prometheus/Grafana stack
- **your-app-dev** - Your application development environment
- **your-app-prod** - Your application production environment

The exact applications depend on your infrastructure needs and what you define
in your Git repository.

### Projects

ArgoCD projects (`k3s-argocd-app-of-apps/projects/`) provide isolation and
access control:

- **cloudnativepg-project** - For CloudNativePG operator and managed clusters
- **redis-project** - For Redis deployments

Example project:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: cloudnativepg-project
  namespace: argocd
spec:
  description: Project for CloudNativePG operator and managed Postgres clusters
  sourceRepos:
    - '*'
  destinations:
    - namespace: argocd
      server: https://kubernetes.default.svc
    - namespace: cnpg-system
      server: https://kubernetes.default.svc
    - namespace: '*'
  clusterResourceWhitelist:
    - group: '*'
      kind: '*'
  namespaceResourceWhitelist:
    - group: '*'
      kind: '*'
```

## Managing Applications

### Adding a New Application

1. **Create application manifest** in your Git repository (e.g.,
   `argocd-app-of-apps/apps/`):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-new-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-repo.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

2. **Commit and push** to the Git repository

3. **ArgoCD automatically syncs** the new application (if automated sync is
   enabled)

### Manual Sync

If automated sync is disabled, sync manually:

```bash
# Via CLI
argocd app sync my-new-app

# Via UI
# Navigate to the application and click "Sync"
```

### Sync Policies

Common sync policy configurations:

**Automated with Self-Heal:**

```yaml
syncPolicy:
  automated:
    prune: true # Delete resources removed from Git
    selfHeal: true # Automatically sync if cluster state drifts
```

**Manual Sync:**

```yaml
syncPolicy:
  syncOptions:
    - CreateNamespace=true
```

**Server-Side Apply:**

```yaml
syncPolicy:
  syncOptions:
    - ServerSideApply=true
    - ApplyOutOfSyncOnly=true
```

## Accessing ArgoCD

### Web UI

Once the ingress is configured, access ArgoCD at:

- `https://argocd.yourdomain.com` (replace with your actual domain)

### Initial Admin Password

Get the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### CLI Access

Install ArgoCD CLI:

```bash
# Linux
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj-labs/argocd-operator/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd
```

Login:

```bash
argocd login argocd.yourdomain.com
```

Replace `argocd.yourdomain.com` with your actual ArgoCD domain.

## Vault Integration

ArgoCD is configured to use HashiCorp Vault for secret management via the ArgoCD
Vault Plugin (AVP). This allows secrets to be stored in Vault and injected
during application sync.

### Configuration

The `values.yaml` configures:

- Vault agent sidecar for token management
- AVP plugin for secret injection
- Vault connection details

See `k3s-argocd/values.yaml` and `k3s-argocd/vault-agent-config.yaml` for
details.

### Using Vault Secrets in Applications

In your Helm values or Kubernetes manifests, reference Vault secrets:

```yaml
# In values.yaml
database:
  password: <vault:secret/data/myapp#password>
```

The AVP plugin will replace these placeholders with actual values from Vault
during sync.

## Verification

### Check ArgoCD Status

```bash
# Check pods
kubectl get pods -n argocd

# Check applications
kubectl get applications -n argocd

# Check sync status
argocd app list
```

### Verify Root Applications

```bash
kubectl get applications -n argocd | grep root
```

You should see:

- `root-app` - Synced
- `root-projects-app` - Synced

### Check Application Health

```bash
# Via CLI
argocd app get <app-name>

# Via UI
# Navigate to the application in the ArgoCD UI
```

## Troubleshooting

### Application Stuck in Syncing

1. **Check application events:**

   ```bash
   kubectl describe application <app-name> -n argocd
   ```

2. **Check ArgoCD logs:**

   ```bash
   kubectl logs -n argocd deployment/argocd-application-controller
   kubectl logs -n argocd deployment/argocd-repo-server
   ```

3. **Check sync status:**
   ```bash
   argocd app get <app-name>
   ```

### Certificate Issues

1. **Check certificate status:**

   ```bash
   kubectl describe certificate argocd-tls -n argocd
   ```

2. **Check cert-manager logs:**

   ```bash
   kubectl logs -n cert-manager deployment/cert-manager
   ```

3. **Verify DNS configuration:**
   ```bash
   dig argocd.yourdomain.com
   ```

### Vault Integration Issues

1. **Check Vault agent logs:**

   ```bash
   kubectl logs -n argocd deployment/argocd-repo-server -c vault-agent
   ```

2. **Verify Vault connection:**

   ```bash
   kubectl exec -n argocd deployment/argocd-repo-server -c vault-agent -- vault status
   ```

3. **Check AVP plugin:**
   ```bash
   kubectl logs -n argocd deployment/argocd-repo-server | grep avp
   ```

## References

- **ArgoCD configuration**: `K3S/k3s-argocd/`
- **App-of-apps structure**: `K3S/k3s-argocd-app-of-apps/`
- **ArgoCD documentation**: https://argo-cd.readthedocs.io/
