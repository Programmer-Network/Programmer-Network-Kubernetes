---
title: Longhorn Volume Backups
---

## Overview

Longhorn provides native backup functionality for persistent volumes. This
ensures your application data is protected independently of the cluster state.
Longhorn backups capture the actual data stored in your persistent volumes and
store them in object storage (Cloudflare R2).

## Configuration Files

The Longhorn backup system consists of three components that you need to create:

1. **Secret** - R2 credentials
2. **BackupTarget** - Backup destination configuration
3. **RecurringJob** - Scheduled backup job

## Setup Steps

1. **Create the R2 Secret:**

   Create a file named `longhorn-r2-secret.yaml` with the following content:

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: r2-longhorn-secret
     namespace: longhorn-system
   type: Opaque
   stringData:
     AWS_ACCESS_KEY_ID: 'YOUR_R2_ACCESS_KEY_ID'
     AWS_SECRET_ACCESS_KEY: 'YOUR_R2_SECRET_ACCESS_KEY'
     AWS_ENDPOINTS: 'https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com'
   ```

   Apply the secret:

   ```bash
   kubectl apply -f longhorn-r2-secret.yaml
   ```

2. **Configure the Backup Target:**

   Create a file named `backup-target.yaml` with the content shown in the
   "Backup Target Configuration" section below, then apply it:

   ```bash
   kubectl apply -f backup-target.yaml
   ```

3. **Create the Daily Backup Job:**

   Create a file named `daily-backup-job.yaml` with the content shown in the
   "Recurring Job Configuration" section below, then apply it:

   ```bash
   kubectl apply -f daily-backup-job.yaml
   ```

## Backup Target Configuration

The `BackupTarget` resource configures where backups are stored:

```yaml
apiVersion: longhorn.io/v1beta2
kind: BackupTarget
metadata:
  name: default
  namespace: longhorn-system
spec:
  backupTargetURL: 's3://k3s-backup-repository@auto/'
  credentialSecret: 'r2-longhorn-secret'
```

### Backup Target URL Format

For Cloudflare R2:

```
s3://<bucket-name>@auto/<optional-path>
```

- `@auto` is the region (R2 doesn't use regions, so `auto` works)
- Optional path can be added for organization (e.g.,
  `s3://bucket@auto/longhorn-backups/`)

## Recurring Job Configuration

The `RecurringJob` defines the backup schedule:

```yaml
apiVersion: longhorn.io/v1beta2
kind: RecurringJob
metadata:
  name: daily-volume-backups
  namespace: longhorn-system
spec:
  task: 'backup'
  cron: '0 2 * * *' # Daily at 2:00 AM
  retain: 7 # Keep 7 backups
  concurrency: 1 # One job at a time
```

### Recurring Job Parameters

- `task`: Type of task (`backup`, `snapshot`, or `snapshot-cleanup`)
- `cron`: Cron expression for schedule
- `retain`: Number of backups to keep
- `concurrency`: How many jobs can run simultaneously

## Volume Labeling

For volumes to be included in the daily backup, they must have the appropriate
label. There are several ways to ensure your volumes are backed up:

### Option 1: Label PVCs at Creation Time (Recommended)

When creating PVCs via Helm charts or manifests, add the backup label:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-data
  namespace: my-app
  labels:
    recurring-job.longhorn.io/daily-volume-backups: enabled
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 10Gi
```

### Option 2: Label Existing PVCs

For existing PVCs, add the label manually:

```bash
# Label a specific PVC
kubectl label pvc <pvc-name> -n <namespace> recurring-job.longhorn.io/daily-volume-backups=enabled

# Label all PVCs using Longhorn storage class
kubectl get pvc --all-namespaces -l storageClassName=longhorn -o name | \
  xargs -I {} kubectl label {} recurring-job.longhorn.io/daily-volume-backups=enabled
```

### Option 3: Label Longhorn Volumes Directly

If PVC labels don't propagate to Longhorn volumes, label them directly:

```bash
kubectl label volume <volume-name> -n longhorn-system recurring-job.longhorn.io/daily-volume-backups=enabled
```

### Option 4: Apply to All Volumes

To apply the recurring job to all volumes (not recommended for production),
leave the `groups` and `labels` fields empty in the RecurringJob spec.

## Verification

1. **Check volume labels:**

   ```bash
   kubectl get volumes -n longhorn-system --show-labels | grep recurring-job
   ```

2. **Monitor backup jobs:**

   ```bash
   kubectl get jobs -n longhorn-system
   ```

3. **Check backup logs:**

   ```bash
   kubectl logs job/<backup-job-name> -n longhorn-system
   ```

4. **Verify backups in R2 bucket:**
   - Check your Cloudflare R2 bucket for backup files

5. **Check recurring jobs:**

   ```bash
   kubectl get recurringjobs -n longhorn-system
   ```

6. **Check backup status in Longhorn UI:**
   ```bash
   kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
   ```
   Navigate to `http://localhost:8080` → Backups

## Restore from Longhorn Backup

### Via Longhorn UI

1. **Access Longhorn UI:**

   ```bash
   kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
   ```

   Open `http://localhost:8080` in your browser

2. **Navigate to Backups** in the Longhorn UI

3. **Select the backup** you want to restore

4. **Create a new volume** from the backup:
   - Click on the backup
   - Click "Create Volume"
   - Choose a name for the restored volume

5. **Update your PVC** to use the restored volume:
   - Delete the old PVC (if needed)
   - Create a new PVC pointing to the restored volume
   - Or update your application to use the restored volume

### Via kubectl

1. **List available backups:**

   ```bash
   kubectl get backups -n longhorn-system
   ```

2. **Create a volume from backup:**
   ```bash
   kubectl create -f - <<EOF
   apiVersion: longhorn.io/v1beta2
   kind: Volume
   metadata:
     name: restored-volume
     namespace: longhorn-system
   spec:
     fromBackup: "s3://bucket@auto/path/to/backup"
   EOF
   ```

## Manual Backup

You can trigger a manual backup for a specific volume:

1. **Via Longhorn UI:**
   - Navigate to Volumes
   - Select the volume
   - Click "Backup Now"

2. **Via kubectl:**
   ```bash
   kubectl create job --from=cronjob/<recurring-job-name> manual-backup-$(date +%s) -n longhorn-system
   ```

## Troubleshooting

### Backups Not Running

1. **Check recurring job status:**

   ```bash
   kubectl get recurringjobs -n longhorn-system
   kubectl describe recurringjob daily-volume-backups -n longhorn-system
   ```

2. **Verify volume labels:**

   ```bash
   kubectl get volumes -n longhorn-system --show-labels
   ```

3. **Check Longhorn manager logs:**
   ```bash
   kubectl logs -n longhorn-system -l app=longhorn-manager | grep backup
   ```

### Backup Target Not Configured

1. **Check backup target:**

   ```bash
   kubectl get backuptarget -n longhorn-system
   kubectl describe backuptarget default -n longhorn-system
   ```

2. **Verify secret exists:**

   ```bash
   kubectl get secret r2-longhorn-secret -n longhorn-system
   ```

3. **Test backup target connection:**
   - Use Longhorn UI → Settings → Backup
   - Click "Test" to verify connection

### Backup Failures

1. **Check backup job logs:**

   ```bash
   kubectl get jobs -n longhorn-system
   kubectl logs job/<backup-job-name> -n longhorn-system
   ```

2. **Verify R2 credentials:**

   ```bash
   kubectl get secret r2-longhorn-secret -n longhorn-system -o yaml
   ```

3. **Check network connectivity:**
   - Verify R2 endpoint is reachable
   - Check firewall rules

### Volume Not Backing Up

1. **Verify volume has the label:**

   ```bash
   kubectl get volume <volume-name> -n longhorn-system --show-labels
   ```

2. **Check if volume is attached:**

   ```bash
   kubectl get volume <volume-name> -n longhorn-system -o yaml | grep attached
   ```

3. **Verify recurring job matches:**
   ```bash
   kubectl get recurringjob daily-volume-backups -n longhorn-system -o yaml
   ```

## Best Practices

1. **Label Strategy**: Use consistent labeling for all production volumes
2. **Retention Policy**: Adjust retention based on your R2 storage costs and
   needs
3. **Test Restores**: Regularly test restoring volumes from backups
4. **Monitor Costs**: Keep an eye on R2 storage usage and costs
5. **Backup Verification**: Set up monitoring to alert on backup failures
6. **Separate Environments**: Use different backup targets or paths for dev/prod

## References

- **Longhorn documentation**: https://longhorn.io/docs/
- **Longhorn backup guide**:
  https://longhorn.io/docs/1.5.3/snapshots-and-backups/
