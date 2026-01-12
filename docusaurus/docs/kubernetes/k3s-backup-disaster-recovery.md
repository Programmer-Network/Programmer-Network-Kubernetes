---
title: Disaster Recovery Procedures
---

## Overview

This guide covers disaster recovery procedures for the four-layer backup
strategy. Each recovery scenario addresses different types of failures and data
loss situations.

## Restore Strategy Overview

Understanding which backup to use and in what order is critical for successful
recovery. This section explains the restore decision process and priority order.

### Backup Layer Purposes

Each backup layer protects different aspects of your cluster:

1. **etcd Snapshots (Layer 1)**: Control plane state
   - Kubernetes API objects
   - Cluster configuration
   - Resource definitions
   - **Use when**: Cluster control plane is corrupted or lost

2. **Longhorn Backups (Layer 2)**: Persistent volume data
   - Raw volume snapshots
   - Independent of cluster state
   - **Use when**: Volume data is corrupted or lost, but cluster is intact

3. **Velero Backups (Layer 3)**: Application-aware backups
   - Kubernetes resources + volumes together
   - Application configurations
   - **Use when**: Applications need to be restored, or complete namespace
     recovery

4. **CloudNative PG Backups (Layer 4)**: Database-consistent backups
   - PostgreSQL base backups + WAL archiving
   - Point-in-time recovery (PITR)
   - **Use when**: Database corruption, PITR needed, or database-specific
     recovery

### Restore Order and Priority

When recovering from a complete cluster failure, follow this order:

1. **Restore Control Plane (etcd)** - Must be first if cluster is gone
2. **Restore Infrastructure (Velero)** - Longhorn, Velero, ArgoCD, etc.
3. **Restore Applications (Velero)** - Your workloads
4. **Verify/Restore Databases (CloudNative PG)** - If Velero didn't capture
   correctly or PITR needed

**Important**: Do NOT restore all layers simultaneously. Restore in order to
avoid conflicts and ensure dependencies are met.

### Restore Decision Matrix

| Failure Type                     | Primary Backup | Secondary Backup | Restore Order              |
| -------------------------------- | -------------- | ---------------- | -------------------------- |
| Complete cluster loss            | etcd           | Velero           | etcd → Velero (infra) →    |
|                                  |                |                  | Velero (apps) → Verify DBs |
| Control plane corruption         | etcd           | -                | etcd snapshot restore      |
| Application failure              | Velero         | -                | Velero restore             |
| Volume data loss                 | Longhorn       | Velero           | Longhorn restore OR Velero |
| Database corruption              | CloudNative PG | Longhorn         | CloudNative PG PITR → Base |
|                                  |                |                  | backup → Longhorn          |
| Database point-in-time recovery  | CloudNative PG | -                | CloudNative PG PITR        |
| Single namespace loss            | Velero         | -                | Velero namespace restore   |
| Infrastructure component failure | Velero         | -                | Velero selective restore   |

### When NOT to Restore All Layers

Avoid restoring multiple layers simultaneously:

- **Don't restore etcd + Velero together**: Restore etcd first, then Velero
- **Don't restore Longhorn + Velero volumes together**: Choose one method
- **Don't restore CloudNative PG + Velero databases together**: Use CloudNative
  PG for database recovery, Velero for application resources

### Quick Decision Guide

**Ask yourself:**

1. **Is the cluster completely gone?**
   - Yes → Start with etcd snapshot restore
   - No → Skip to step 2

2. **Is the infrastructure (Longhorn, Velero, ArgoCD) broken?**
   - Yes → Restore infrastructure via Velero
   - No → Skip to step 3

3. **Are applications broken?**
   - Yes → Restore applications via Velero
   - No → Skip to step 4

4. **Is the database corrupted or do you need PITR?**
   - Yes → Use CloudNative PG backup restore
   - No → Verify database health

## Recovery Scenarios

### Scenario 1: Complete Cluster Failure

This is the worst-case scenario where the entire cluster is lost and needs to be
rebuilt from scratch.

#### Prerequisites

- Access to Cloudflare R2 bucket with backups
- R2 credentials for all four backup layers
- Fresh server(s) for cluster rebuild

#### Recovery Steps (In Order)

**Step 1: Restore Control Plane (etcd)**

1. **Reinstall K3s:**

   ```bash
   curl -sfL https://get.k3s.io | sh -
   sudo k3s kubectl get nodes
   ```

2. **Restore etcd (if needed):**

   ```bash
   sudo k3s server \
     --cluster-init \
     --etcd-s3 \
     --etcd-s3-bucket k3s-backup-repository \
     --etcd-s3-folder k3s-etcd-snapshots \
     --etcd-s3-endpoint "<ACCOUNT_ID>.r2.cloudflarestorage.com" \
     --etcd-s3-access-key "<ACCESS_KEY>" \
     --etcd-s3-secret-key "<SECRET_KEY>" \
     --cluster-reset-restore-path <snapshot-name>
   ```

   This restores the control plane state from the etcd snapshot.

**Step 2: Restore Infrastructure Components**

3. **Reinstall Longhorn:**

   ```bash
   helm repo add longhorn https://charts.longhorn.io
   helm repo update
   helm install longhorn longhorn/longhorn \
     --namespace longhorn-system \
     --create-namespace \
     --set persistence.defaultClass=true
   ```

   Wait for Longhorn pods to be running:

   ```bash
   kubectl get pods -n longhorn-system --watch
   ```

4. **Reinstall Velero:**

   ```bash
   kubectl create namespace velero
   kubectl apply -f velero-r2-secret.yaml
   helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
   helm install velero vmware-tanzu/velero --namespace velero -f velero-values.yaml
   ```

   Make sure you have the `velero-r2-secret.yaml` and `velero-values.yaml` files
   from your original setup.

5. **Verify Velero can see backups:**

   ```bash
   # Wait a minute for Velero to sync
   velero backup get
   ```

   You should see your previous backups listed.

**Step 3: Restore Applications**

6. **Restore from Velero backup:**

   ```bash
   velero restore create --from-backup <backup-name> --wait
   ```

**Step 4: Verify and Restore Databases**

7. **Verify restored applications:**

   ```bash
   kubectl get pods --all-namespaces
   kubectl get pvc --all-namespaces
   ```

8. **Check database cluster status:**

   ```bash
   kubectl get clusters.postgresql.cnpg.io -A
   kubectl get pods -A -l cnpg.io/cluster
   ```

9. **If databases need restoration:**
   - If Velero restored databases correctly, verify they're healthy
   - If databases are corrupted or missing, restore from CloudNative PG backups
     (see
     [PostgreSQL Database Recovery](#scenario-6-postgresql-database-recovery)
     below)
   - If point-in-time recovery is needed, use CloudNative PG PITR

### Scenario 2: Control Plane Corruption

When the etcd database is corrupted but the cluster is still running.

#### Recovery Steps

1. **Stop k3s on all nodes:**

   ```bash
   sudo systemctl stop k3s
   ```

2. **Restore from etcd snapshot:**

   ```bash
   sudo k3s server \
     --cluster-init \
     --etcd-s3 \
     --etcd-s3-bucket k3s-backup-repository \
     --etcd-s3-folder k3s-etcd-snapshots \
     --etcd-s3-endpoint "<ACCOUNT_ID>.r2.cloudflarestorage.com" \
     --etcd-s3-access-key "<ACCESS_KEY>" \
     --etcd-s3-secret-key "<SECRET_KEY>" \
     --cluster-reset-restore-path <snapshot-name>
   ```

3. **Restart k3s on other nodes:**
   ```bash
   sudo systemctl start k3s
   ```

### Scenario 3: Volume Data Loss

When persistent volume data is lost but the cluster is intact.

#### Recovery Steps

1. **Identify the affected volumes:**

   ```bash
   kubectl get pvc --all-namespaces
   ```

2. **Access Longhorn UI:**

   ```bash
   kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
   ```

   Open `http://localhost:8080`

3. **Restore from Longhorn backup:**
   - Navigate to Backups
   - Find the backup for the affected volume
   - Create a new volume from the backup
   - Update the PVC to use the restored volume

4. **Or restore via Velero:**
   ```bash
   velero restore create --from-backup <backup-name> \
     --include-namespaces <affected-namespace> \
     --wait
   ```

### Scenario 4: Single Application Failure

When a single application needs to be restored.

#### Recovery Steps

**Option 1: Restore from Velero (Recommended)**

```bash
velero restore create --from-backup <backup-name> \
  --include-namespaces <application-namespace> \
  --wait
```

**Option 2: Restore from Longhorn**

1. Restore the application's volumes from Longhorn backups
2. Recreate the application manifests
3. Update PVCs to point to restored volumes

### Scenario 5: Partial Namespace Recovery

When specific resources in a namespace need to be restored.

#### Recovery Steps

```bash
velero restore create --from-backup <backup-name> \
  --include-namespaces <namespace> \
  --include-resources deployments,services,configmaps \
  --wait
```

### Scenario 6: PostgreSQL Database Recovery

When PostgreSQL databases managed by CloudNative PG need to be restored. This
scenario covers database corruption, point-in-time recovery, and complete
database cluster restoration.

#### When to Use CloudNative PG Backups vs Other Backups

**Use CloudNative PG backups when:**

- Database corruption is detected
- Point-in-time recovery (PITR) is needed
- Database-specific recovery is required
- Velero backup didn't capture database correctly
- Cross-cluster database migration

**Use Velero/Longhorn backups when:**

- Complete application restore (including database)
- Volume-level recovery is sufficient
- Database is part of larger application recovery

#### Recovery Options

**Option 1: Point-in-Time Recovery (PITR) - Recommended for Corruption**

If you need to recover to a specific time before corruption occurred:

1. **Identify the backup and target time:**

   ```bash
   kubectl get backups -n <postgres-namespace>
   # Note the backup name and determine the recovery target time
   ```

2. **Create a new cluster with PITR:**

   ```yaml
   apiVersion: postgresql.cnpg.io/v1
   kind: Cluster
   metadata:
     name: <cluster-name>-restored
     namespace: <postgres-namespace>
   spec:
     instances: 3
     imageName: ghcr.io/cloudnative-pg/postgresql:15

     bootstrap:
       recovery:
         backup:
           name: <backup-name>
         recoveryTarget:
           targetTime: '2024-01-15 14:30:00' # Time before corruption

     backup:
       # Same backup configuration as original cluster
       barmanObjectStore:
         destinationPath: s3://postgres-backups/<cluster-name>
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

3. **Apply the restored cluster:**

   ```bash
   kubectl apply -f restored-cluster.yaml
   ```

4. **Monitor restoration:**

   ```bash
   kubectl get cluster <cluster-name>-restored -n <postgres-namespace> -w
   kubectl get pods -n <postgres-namespace> -l cnpg.io/cluster=<cluster-name>-restored
   ```

**Option 2: Restore from Base Backup**

If PITR is not needed, restore from a base backup:

1. **List available backups:**

   ```bash
   kubectl get backups -n <postgres-namespace>
   ```

2. **Create cluster from backup:**

   ```yaml
   apiVersion: postgresql.cnpg.io/v1
   kind: Cluster
   metadata:
     name: <cluster-name>-restored
     namespace: <postgres-namespace>
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
         # ... same configuration
   ```

3. **Apply and verify:**

   ```bash
   kubectl apply -f restored-cluster.yaml
   kubectl get cluster <cluster-name>-restored -n <postgres-namespace>
   ```

**Option 3: Restore to Different Namespace**

If you need to restore to a different namespace:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: <cluster-name>-restored
  namespace: <new-namespace> # Different namespace
spec:
  # ... same configuration
  bootstrap:
    recovery:
      backup:
        name: <backup-name>
        namespace: <original-namespace> # Original namespace
```

#### Recovery Steps for Database Corruption

1. **Stop the corrupted cluster (if needed):**

   ```bash
   kubectl delete cluster <cluster-name> -n <namespace>
   ```

2. **Choose recovery method:**
   - If you know the exact time before corruption → Use PITR (Option 1)
   - If you need the latest backup → Use base backup (Option 2)

3. **Create restored cluster** using one of the options above

4. **Update application connections:**
   - Update service endpoints if cluster name changed
   - Update connection strings in application configs
   - Verify applications can connect to restored database

5. **Verify data integrity:**

   ```bash
   # Connect to restored database
   kubectl exec -it <cluster-name>-restored-1 -n <namespace> -- \
     psql -U postgres -c "SELECT COUNT(*) FROM <table-name>;"

   # Compare with expected data
   # Run application-specific data validation
   ```

#### Recovery Decision Flow

```
Database Issue Detected
    │
    ├─ Need PITR? ──Yes──> Use CloudNative PG PITR (Option 1)
    │
    └─No──> Latest backup sufficient? ──Yes──> Use CloudNative PG base backup (Option 2)
            │
            └─No──> Try Longhorn volume restore
                    │
                    └─No──> Use Velero backup (last resort)
```

## Recovery Verification

After any recovery operation, verify the following:

### Cluster Health

```bash
# Check nodes
kubectl get nodes

# Check pods
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces
```

### Application Functionality

1. **Test application endpoints:**

   ```bash
   kubectl get ingress --all-namespaces
   curl <application-url>
   ```

2. **Verify data integrity:**
   - Check application logs
   - Verify database connections
   - Test critical functionality

3. **Check persistent volumes:**
   ```bash
   kubectl get pvc --all-namespaces
   kubectl get volumes -n longhorn-system
   ```

### Backup System Health

```bash
# Check etcd snapshots
sudo k3s etcd-snapshot list

# Check Longhorn backups
kubectl get recurringjobs -n longhorn-system
kubectl get backups -n longhorn-system

# Check Velero backups
velero backup get
kubectl get schedules -n velero

# Check CloudNative PG backups
kubectl get backups -A
kubectl get cronjobs -A | grep postgres-backup
```

## Recovery Testing

Regular recovery testing is crucial to ensure your backup strategy works.

### Test Schedule

- **Monthly**: Test restoring a single application
- **Quarterly**: Test restoring a namespace
- **Annually**: Test complete cluster recovery

### Test Procedure

1. **Create a test namespace:**

   ```bash
   kubectl create namespace backup-test
   ```

2. **Deploy a test application:**

   ```bash
   kubectl apply -f test-app.yaml -n backup-test
   ```

3. **Create a backup:**

   ```bash
   velero backup create test-backup --include-namespaces backup-test --wait
   ```

4. **Delete the test application:**

   ```bash
   kubectl delete namespace backup-test
   ```

5. **Restore from backup:**

   ```bash
   velero restore create --from-backup test-backup --wait
   ```

6. **Verify restoration:**

   ```bash
   kubectl get all -n backup-test
   ```

7. **Clean up:**
   ```bash
   kubectl delete namespace backup-test
   velero backup delete test-backup
   ```

## Recovery Best Practices

1. **Document Recovery Procedures**: Keep detailed documentation of recovery
   steps
2. **Regular Testing**: Test recovery procedures regularly
3. **Backup Verification**: Verify backups before you need them
4. **Recovery Runbooks**: Create runbooks for common recovery scenarios
5. **Communication Plan**: Have a plan for communicating during disasters
6. **Recovery Time Objectives**: Define RTO (Recovery Time Objective) and RPO
   (Recovery Point Objective)
7. **Backup Monitoring**: Set up alerts for backup failures
8. **Documentation**: Keep recovery documentation up to date

## Troubleshooting Recovery Issues

### Velero Restore Fails

1. **Check restore status:**

   ```bash
   velero restore describe <restore-name>
   ```

2. **Review restore logs:**

   ```bash
   velero restore logs <restore-name>
   ```

3. **Check resource conflicts:**
   - Some resources may already exist
   - Use `--restore-resource-filters` to exclude conflicting resources

### Longhorn Volume Restore Fails

1. **Check volume status:**

   ```bash
   kubectl get volumes -n longhorn-system
   kubectl describe volume <volume-name> -n longhorn-system
   ```

2. **Verify backup exists:**
   - Check Longhorn UI → Backups
   - Verify backup is accessible

3. **Check storage space:**
   ```bash
   kubectl get nodes
   # Check available disk space on nodes
   ```

### etcd Restore Fails

1. **Verify snapshot exists:**
   - Check R2 bucket for snapshot files
   - Verify snapshot name is correct

2. **Check k3s logs:**

   ```bash
   sudo journalctl -u k3s -f
   ```

3. **Verify R2 credentials:**
   - Check R2 access key and secret
   - Verify bucket permissions

## References

- **[etcd Snapshots](./k3s-backup-etcd)** - etcd backup and restore
- **[Longhorn Backups](./k3s-backup-longhorn)** - Volume backup and restore
- **[Velero Backups](./k3s-backup-velero)** - Cluster backup and restore
- **[CloudNative PG Backups](./k3s-backup-cloudnative-pg)** - PostgreSQL backup
  and restore
