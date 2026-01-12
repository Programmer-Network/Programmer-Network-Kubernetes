---
title: CloudNative PG Backups
---

## Overview

CloudNative PG provides PostgreSQL-specific backup capabilities that ensure
database consistency and enable point-in-time recovery (PITR). Unlike generic
volume backups, PostgreSQL backups require special handling to maintain
transactional integrity.

### Why PostgreSQL Backups Are Different

PostgreSQL databases need consistent snapshots that account for:

- **Transaction isolation**: Backups must capture a consistent state across all
  tables
- **Write-Ahead Logging (WAL)**: Transaction logs enable point-in-time recovery
- **Concurrent operations**: Backups must handle active transactions without
  blocking
- **Data integrity**: Ensures no partial transactions or corrupted data

CloudNative PG handles these requirements automatically through physical backups
and WAL archiving.

### Backup Types

CloudNative PG supports two backup mechanisms:

1. **Base Backups**: Full physical backups of the database cluster (snapshots)
2. **WAL Archiving**: Continuous archiving of Write-Ahead Log files for PITR

Together, these enable:

- Full cluster restores from base backups
- Point-in-time recovery to any moment after the first base backup
- Continuous protection with minimal data loss

## Prerequisites

Before configuring backups, ensure you have:

- CloudNative PG operator installed (see
  [CloudNative PG Setup](../databases/setup-cloudnative-pg))
- A PostgreSQL cluster managed by CloudNative PG
- Cloudflare R2 bucket for backup storage (or S3-compatible storage)
- R2 API credentials (Access Key ID and Secret Access Key)

## Backup Storage Configuration

### Create R2 Bucket

1. In your Cloudflare dashboard, go to **R2** and click **Create bucket**
2. Give it a unique name (e.g., `postgres-backups`)
3. Note your **S3 Endpoint URL** from the bucket's main page:
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Create R2 API Credentials

1. On the main R2 page, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name (e.g., `postgres-backup-token`) and grant it **Object Read &
   Write** permissions
4. Securely copy the **Access Key ID** and **Secret Access Key**

### Create Backup Storage Secret

Create a Kubernetes secret with your R2 credentials:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-backup-credentials
  namespace: <your-postgres-namespace>
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: <your-access-key-id>
  AWS_SECRET_ACCESS_KEY: <your-secret-access-key>
  AWS_ENDPOINTS: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Apply the secret:

```bash
kubectl apply -f postgres-backup-credentials.yaml
```

### Configure Cluster for Backups

Update your PostgreSQL cluster to enable backups. Add backup configuration to
your cluster spec:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: my-postgres-cluster
  namespace: postgres-db
spec:
  instances: 3
  imageName: ghcr.io/cloudnative-pg/postgresql:15

  # Backup configuration
  backup:
    barmanObjectStore:
      destinationPath: s3://postgres-backups/my-cluster
      s3Credentials:
        accessKeyId:
          name: postgres-backup-credentials
          key: AWS_ACCESS_KEY_ID
        secretAccessKey:
          name: postgres-backup-credentials
          key: AWS_SECRET_ACCESS_KEY
        region: auto
        endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
      wal:
        retention: 7d # Keep WAL files for 7 days
      data:
        retention: 30d # Keep base backups for 30 days
      tags:
        cluster: my-postgres-cluster
        environment: production
```

**Key Configuration Options:**

- `destinationPath`: S3 path where backups will be stored
- `wal.retention`: How long to keep WAL files (enables PITR)
- `data.retention`: How long to keep base backups
- `tags`: Optional metadata for backup organization

## Scheduled Backups

CloudNative PG uses the `Backup` CRD to create scheduled backups. You can create
recurring backups using Kubernetes CronJobs or the operator's built-in
scheduling.

### Create a Scheduled Backup

Create a `Backup` resource with a schedule:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: daily-backup
  namespace: postgres-db
spec:
  cluster:
    name: my-postgres-cluster
  method: barmanObjectStore
  target: primary
  retentionPolicy: '30d'
```

### Backup Schedule (4 Times Daily)

To create backups 4 times per day (every 6 hours), create multiple Backup
resources or use a CronJob:

**Option 1: Multiple Backup Resources**

Create 4 separate Backup resources with different schedules:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup-00
  namespace: postgres-db
spec:
  schedule: '0 0 * * *' # Daily at midnight
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: ghcr.io/cloudnative-pg/cloudnative-pg:1.26.0
              command:
                - /bin/sh
                - -c
                - |
                  kubectl create backup backup-$(date +%Y%m%d-%H%M%S) \
                    --cluster=my-postgres-cluster \
                    --namespace=postgres-db \
                    --dry-run=client -o yaml | kubectl apply -f -
          restartPolicy: OnFailure
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup-06
  namespace: postgres-db
spec:
  schedule: '0 6 * * *' # Daily at 6 AM
  # ... same jobTemplate as above
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup-12
  namespace: postgres-db
spec:
  schedule: '0 12 * * *' # Daily at noon
  # ... same jobTemplate as above
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup-18
  namespace: postgres-db
spec:
  schedule: '0 18 * * *' # Daily at 6 PM
  # ... same jobTemplate as above
```

**Option 2: Single CronJob with Multiple Triggers**

A simpler approach is to use a single CronJob that runs every 6 hours:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: postgres-db
spec:
  schedule: '0 */6 * * *' # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: postgres-backup-sa
          containers:
            - name: backup
              image: bitnami/kubectl:latest
              command:
                - /bin/sh
                - -c
                - |
                  cat <<EOF | kubectl apply -f -
                  apiVersion: postgresql.cnpg.io/v1
                  kind: Backup
                  metadata:
                    name: backup-$(date +%Y%m%d-%H%M%S)
                    namespace: postgres-db
                  spec:
                    cluster:
                      name: my-postgres-cluster
                    method: barmanObjectStore
                    target: primary
                  EOF
          restartPolicy: OnFailure
```

**Create ServiceAccount for CronJob:**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: postgres-backup-sa
  namespace: postgres-db
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: postgres-backup-role
  namespace: postgres-db
rules:
  - apiGroups: ['postgresql.cnpg.io']
    resources: ['backups']
    verbs: ['create', 'get', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: postgres-backup-binding
  namespace: postgres-db
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: postgres-backup-role
subjects:
  - kind: ServiceAccount
    name: postgres-backup-sa
    namespace: postgres-db
```

## Manual Backups

You can create on-demand backups at any time using the `Backup` CRD:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: manual-backup-20240115
  namespace: postgres-db
spec:
  cluster:
    name: my-postgres-cluster
  method: barmanObjectStore
  target: primary
```

Apply the backup:

```bash
kubectl apply -f manual-backup.yaml
```

Or create directly with kubectl:

```bash
kubectl create backup manual-backup-$(date +%Y%m%d-%H%M%S) \
  --cluster=my-postgres-cluster \
  --namespace=postgres-db
```

## Backup Verification

### Check Backup Status

List all backups for a cluster:

```bash
kubectl get backups -n postgres-db -l cnpg.io/cluster=my-postgres-cluster
```

Describe a specific backup:

```bash
kubectl describe backup <backup-name> -n postgres-db
```

### Verify Backup Completion

Check backup status:

```bash
kubectl get backup <backup-name> -n postgres-db -o jsonpath='{.status.phase}'
```

Status values:

- `Pending`: Backup is queued
- `Running`: Backup in progress
- `Completed`: Backup finished successfully
- `Failed`: Backup failed

### Check Backup in R2

Verify backups exist in your R2 bucket:

```bash
# Using AWS CLI (configured for R2)
aws s3 ls s3://postgres-backups/my-cluster/ --endpoint-url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

### Verify WAL Archiving

Check if WAL archiving is working:

```bash
# Check cluster status
kubectl get cluster my-postgres-cluster -n postgres-db -o yaml | grep -A 10 backup

# Check WAL files in R2
aws s3 ls s3://postgres-backups/my-cluster/wal/ --endpoint-url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

## Point-in-Time Recovery (PITR)

CloudNative PG supports point-in-time recovery, allowing you to restore to any
specific timestamp after your first base backup.

### PITR Requirements

- Base backup must exist
- WAL archiving must be enabled and continuous
- WAL files must be available for the time period you want to recover to

### Restore to Specific Time

Create a new cluster from a backup with PITR:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: my-postgres-cluster-restored
  namespace: postgres-db
spec:
  instances: 3
  imageName: ghcr.io/cloudnative-pg/postgresql:15

  bootstrap:
    recovery:
      backup:
        name: <backup-name>
      recoveryTarget:
        targetTime: '2024-01-15 14:30:00' # Restore to this timestamp
        # Or use:
        # targetXID: "<transaction-id>"
        # targetLSN: "<log-sequence-number>"
        # targetName: "<recovery-point-name>"

      source: <backup-name>

  backup:
    barmanObjectStore:
      # Same backup configuration as original cluster
      destinationPath: s3://postgres-backups/my-cluster
      s3Credentials:
        accessKeyId:
          name: postgres-backup-credentials
          key: AWS_ACCESS_KEY_ID
        secretAccessKey:
          name: postgres-backup-credentials
          key: AWS_SECRET_ACCESS_KEY
        region: auto
        endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

**Recovery Target Options:**

- `targetTime`: Restore to a specific timestamp (most common)
- `targetXID`: Restore to a specific transaction ID
- `targetLSN`: Restore to a specific log sequence number
- `targetName`: Restore to a named recovery point

## Restore Procedures

### Restore from Base Backup

To restore a cluster from a base backup:

1. **Identify the backup to restore:**

   ```bash
   kubectl get backups -n postgres-db
   ```

2. **Create a new cluster from backup:**

   ```yaml
   apiVersion: postgresql.cnpg.io/v1
   kind: Cluster
   metadata:
     name: my-postgres-cluster-restored
     namespace: postgres-db
   spec:
     instances: 3
     imageName: ghcr.io/cloudnative-pg/postgresql:15

     bootstrap:
       recovery:
         backup:
           name: <backup-name>
         source: <backup-name>

     backup:
       # Same backup configuration as original
       barmanObjectStore:
         destinationPath: s3://postgres-backups/my-cluster
         s3Credentials:
           # ... same credentials as original
   ```

3. **Apply the cluster:**

   ```bash
   kubectl apply -f restored-cluster.yaml
   ```

4. **Monitor restoration:**

   ```bash
   kubectl get cluster my-postgres-cluster-restored -n postgres-db -w
   kubectl get pods -n postgres-db -l cnpg.io/cluster=my-postgres-cluster-restored
   ```

### Restore to Different Namespace

You can restore a cluster to a different namespace:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: my-postgres-cluster-restored
  namespace: postgres-db-restored # Different namespace
spec:
  # ... same configuration
  bootstrap:
    recovery:
      backup:
        name: <backup-name>
        namespace: postgres-db # Original namespace
```

### Verify Restored Cluster

After restoration, verify the cluster:

```bash
# Check cluster status
kubectl get cluster my-postgres-cluster-restored -n postgres-db

# Check pods
kubectl get pods -n postgres-db -l cnpg.io/cluster=my-postgres-cluster-restored

# Connect and verify data
kubectl exec -it my-postgres-cluster-restored-1 -n postgres-db -- psql -U postgres -c "SELECT version();"
```

## Backup Monitoring

### Check Backup Schedule

```bash
# Check CronJobs
kubectl get cronjobs -n postgres-db

# Check recent backup jobs
kubectl get jobs -n postgres-db -l job-name=postgres-backup
```

### Monitor Backup Logs

```bash
# Check backup pod logs
kubectl logs -n postgres-db -l cnpg.io/cluster=my-postgres-cluster | grep backup

# Check CloudNative PG operator logs
kubectl logs -n cnpg-system deployment/cloudnative-pg-controller-manager | grep backup
```

### Set Up Alerts

Consider setting up monitoring alerts for:

- Backup failures
- WAL archiving failures
- Backup storage quota warnings
- Backup age (if backups are too old)

## Backup Retention and Cleanup

CloudNative PG automatically manages backup retention based on your
configuration:

- **Base backups**: Retained according to `data.retention` (e.g., 30 days)
- **WAL files**: Retained according to `wal.retention` (e.g., 7 days)

Old backups and WAL files are automatically cleaned up by the operator.

### Manual Cleanup

To manually delete a backup:

```bash
kubectl delete backup <backup-name> -n postgres-db
```

**Note:** This only removes the Kubernetes resource. The actual backup files in
R2 are managed by the retention policy.

## Troubleshooting

### Backup Stuck in Pending

1. **Check cluster status:**

   ```bash
   kubectl get cluster <cluster-name> -n <namespace>
   kubectl describe cluster <cluster-name> -n <namespace>
   ```

2. **Check backup credentials:**

   ```bash
   kubectl get secret postgres-backup-credentials -n <namespace>
   ```

3. **Check R2 connectivity:**

   ```bash
   # Test from a pod
   kubectl run -it --rm test-r2 --image=amazon/aws-cli --restart=Never -- \
     aws s3 ls s3://postgres-backups/ --endpoint-url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

### Backup Fails

1. **Check backup status:**

   ```bash
   kubectl describe backup <backup-name> -n <namespace>
   ```

2. **Check operator logs:**

   ```bash
   kubectl logs -n cnpg-system deployment/cloudnative-pg-controller-manager | grep <backup-name>
   ```

3. **Common issues:**
   - Invalid R2 credentials
   - Insufficient storage space
   - Network connectivity issues
   - Cluster not in healthy state

### WAL Archiving Not Working

1. **Check cluster backup configuration:**

   ```bash
   kubectl get cluster <cluster-name> -n <namespace> -o yaml | grep -A 20 backup
   ```

2. **Verify WAL files in R2:**

   ```bash
   aws s3 ls s3://postgres-backups/my-cluster/wal/ --endpoint-url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

3. **Check cluster logs:**

   ```bash
   kubectl logs -n <namespace> <cluster-pod-name> | grep wal
   ```

## Best Practices

1. **Test Backups Regularly**: Verify backups can be restored
2. **Monitor Backup Success**: Set up alerts for backup failures
3. **Retention Policy**: Balance retention with storage costs
4. **WAL Retention**: Keep WAL files long enough for your RPO (Recovery Point
   Objective)
5. **Separate Buckets**: Use dedicated R2 buckets for PostgreSQL backups
6. **Encryption**: Consider enabling encryption at rest in R2
7. **Documentation**: Document your backup schedule and retention policies
8. **Recovery Testing**: Regularly test restore procedures

## Integration with Backup Strategy

CloudNative PG backups complement the three-layer backup strategy:

- **Layer 1 (etcd)**: Control plane state
- **Layer 2 (Longhorn)**: Volume-level backups
- **Layer 3 (Velero)**: Application-aware backups
- **Layer 4 (CloudNative PG)**: Database-consistent backups with PITR

**When to use CloudNative PG backups:**

- Point-in-time recovery needed
- Database corruption requiring precise recovery
- Cross-cluster database migration
- Database-specific recovery scenarios

**When to use other backups:**

- Complete application restore (use Velero)
- Volume-level recovery (use Longhorn)
- Cluster-level recovery (use etcd + Velero)

See [Disaster Recovery](./k3s-backup-disaster-recovery) for guidance on when to
use each backup layer.

## Related Documentation

- [Backup Strategy Overview](./k3s-backup) - Complete backup strategy
- [Disaster Recovery](./k3s-backup-disaster-recovery) - Recovery procedures
- [CloudNative PG Setup](../databases/setup-cloudnative-pg) - Operator
  installation
