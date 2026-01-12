---
title: Velero Cluster Backups
---

## Overview

Velero provides application-aware backups that capture both Kubernetes resources
and persistent volume data using CSI snapshots. This layer provides the most
comprehensive backup solution, allowing you to restore entire applications or
the entire cluster.

## Installation

Velero is installed via Helm with custom values. First, create the necessary
configuration files:

1. **Create the R2 secret file** (`velero-r2-secret.yaml`):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: velero-r2-secret
  namespace: velero
type: Opaque
stringData:
  cloud: |
    [default]
    aws_access_key_id = YOUR_R2_ACCESS_KEY_ID
    aws_secret_access_key = YOUR_R2_SECRET_ACCESS_KEY
```

2. **Create the Helm values file** (`velero-values.yaml`) - see Configuration
   section below

3. **Install Velero:**

```bash
kubectl create namespace velero
kubectl apply -f velero-r2-secret.yaml
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update
helm install velero vmware-tanzu/velero --namespace velero -f velero-values.yaml
```

### Prerequisites

- Longhorn installed (for CSI snapshots)
- Cloudflare R2 bucket created
- R2 API credentials

## Configuration

Create a `velero-values.yaml` file with the following configuration:

```yaml
credentials:
  useSecret: true
  existingSecret: velero-r2-secret

configuration:
  backupStorageLocation:
    - name: default
      provider: aws
      bucket: 'your-velero-backup-bucket'
      config:
        s3Url: 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com'
        region: auto
        prefix: 'velero'
  volumeSnapshotLocation:
    - name: default
      provider: velero.io/csi
  features:
    - EnableCSI

initContainers:
  - name: velero-plugin-for-aws
    image: velero/velero-plugin-for-aws:v1.12.1
    volumeMounts:
      - mountPath: /target
        name: plugins
```

Replace:

- `your-velero-backup-bucket` with your R2 bucket name
- `<ACCOUNT_ID>` with your Cloudflare account ID

## Daily Backup Schedule

Create a `daily-cluster-backup.yaml` file with the following schedule:

```yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-cluster-backup
  namespace: velero
spec:
  schedule: '0 3 * * *' # Daily at 3:00 AM
  template:
    ttl: '336h0m0s' # Retain for 14 days
    excludedNamespaces:
      - kube-system
      - velero
      - longhorn-system
```

Apply the schedule:

```bash
kubectl apply -f daily-cluster-backup.yaml
```

### Schedule Configuration

- `schedule`: Cron expression for backup timing
- `ttl`: Time-to-live for backups (336h = 14 days)
- `excludedNamespaces`: Namespaces to exclude from backup

## Verification

1. **Check Velero pods:**

   ```bash
   kubectl get pods -n velero
   ```

   All pods should be in `Running` state.

2. **List backup schedules:**

   ```bash
   kubectl get schedules -n velero
   ```

3. **List backups:**

   ```bash
   velero backup get
   ```

4. **Check backup details:**

   ```bash
   velero backup describe <backup-name>
   ```

5. **Check Velero server logs:**
   ```bash
   kubectl logs -n velero deployment/velero
   ```

## Installing Velero CLI

To interact with Velero, install the CLI client:

```bash
# Download and extract (Linux)
wget https://github.com/vmware-tanzu/velero/releases/download/v1.16.1/velero-v1.16.1-linux-amd64.tar.gz
tar -xvf velero-v1.16.1-linux-amd64.tar.gz
sudo mv velero-v1.16.1-linux-amd64/velero /usr/local/bin/velero

# Verify installation
velero version
```

### Configure Velero CLI

Point the CLI to your Velero server:

```bash
velero client config set server=http://localhost:8085
```

Or use port-forwarding:

```bash
kubectl port-forward -n velero deployment/velero 8085:8085
```

## Manual Backup Operations

### Create a Manual Backup

**Full cluster backup:**

```bash
velero backup create <backup-name> --wait
```

**Backup specific namespaces:**

```bash
velero backup create <backup-name> --include-namespaces <namespace1>,<namespace2> --wait
```

**Backup with specific resources:**

```bash
velero backup create <backup-name> \
  --include-resources deployments,services,configmaps,secrets \
  --wait
```

### List Backups

```bash
velero backup get
```

### Describe Backup

```bash
velero backup describe <backup-name>
```

### Delete Backup

```bash
velero backup delete <backup-name>
```

### Restore from Backup

**Full restore:**

```bash
velero restore create --from-backup <backup-name> --wait
```

**Restore specific namespaces:**

```bash
velero restore create --from-backup <backup-name> \
  --include-namespaces <namespace> \
  --wait
```

**Restore specific resources:**

```bash
velero restore create --from-backup <backup-name> \
  --include-resources deployments,services \
  --wait
```

**Restore with namespace mapping:**

```bash
velero restore create --from-backup <backup-name> \
  --namespace-mappings old-namespace:new-namespace \
  --wait
```

## Backup Scheduling

### Create Custom Schedule

```yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: weekly-full-backup
  namespace: velero
spec:
  schedule: '0 2 * * 0' # Every Sunday at 2:00 AM
  template:
    ttl: '720h0m0s' # Retain for 30 days
    includedNamespaces:
      - production
```

### Pause/Resume Schedule

```bash
# Pause
kubectl patch schedule daily-cluster-backup -n velero --type merge -p '{"spec":{"paused":true}}'

# Resume
kubectl patch schedule daily-cluster-backup -n velero --type merge -p '{"spec":{"paused":false}}'
```

## Restore Operations

### Check Restore Status

```bash
velero restore get
velero restore describe <restore-name>
```

### Restore Logs

```bash
velero restore logs <restore-name>
```

### Delete Restore

```bash
velero restore delete <restore-name>
```

## Troubleshooting

### Velero Pod Not Starting

1. **Check pod status:**

   ```bash
   kubectl get pods -n velero
   kubectl describe pod <velero-pod-name> -n velero
   ```

2. **Check logs:**

   ```bash
   kubectl logs -n velero deployment/velero
   ```

3. **Verify secret:**
   ```bash
   kubectl get secret velero-r2-secret -n velero
   ```

### Backup Failures

1. **Check backup status:**

   ```bash
   velero backup describe <backup-name>
   ```

2. **Check Velero logs:**

   ```bash
   kubectl logs -n velero deployment/velero | grep <backup-name>
   ```

3. **Verify R2 connectivity:**
   - Check R2 credentials
   - Verify bucket exists and is accessible
   - Check network connectivity

### CSI Snapshot Issues

1. **Check VolumeSnapshotClass:**

   ```bash
   kubectl get volumesnapshotclass
   ```

2. **Verify CSI driver:**

   ```bash
   kubectl get csidriver
   ```

3. **Check Longhorn CSI:**
   ```bash
   kubectl get pods -n longhorn-system | grep csi
   ```

### Restore Failures

1. **Check restore status:**

   ```bash
   velero restore describe <restore-name>
   ```

2. **Review restore logs:**

   ```bash
   velero restore logs <restore-name>
   ```

3. **Verify target namespace exists:**
   ```bash
   kubectl get namespaces
   ```

## Best Practices

1. **Regular Testing**: Test restores regularly to ensure backups are valid
2. **Retention Policy**: Balance retention with storage costs
3. **Namespace Exclusion**: Exclude infrastructure namespaces from backups
4. **Backup Verification**: Monitor backup completion and success rates
5. **Documentation**: Document important backups (e.g., before major upgrades)
6. **Multiple Schedules**: Use different schedules for different environments
7. **Resource Filtering**: Only backup what you need to reduce backup size

## References

- **Velero documentation**: https://velero.io/docs/
- **Velero GitHub**: https://github.com/vmware-tanzu/velero
- **Velero Helm chart**: https://github.com/vmware-tanzu/helm-charts
