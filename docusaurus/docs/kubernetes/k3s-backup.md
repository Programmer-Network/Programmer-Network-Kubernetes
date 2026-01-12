---
title: Production Backup Strategy Overview
---

## Overview

This production K3s cluster uses a comprehensive four-layer backup strategy to
ensure data protection at different levels:

1. **[K3s etcd Snapshots](./k3s-backup-etcd)** - Control plane database backups
2. **[Longhorn Volume Backups](./k3s-backup-longhorn)** - Persistent volume
   backups
3. **[Velero Cluster Backups](./k3s-backup-velero)** - Application-aware cluster
   backups
4. **[CloudNative PG Backups](./k3s-backup-cloudnative-pg)** - PostgreSQL
   database-consistent backups with point-in-time recovery

All backups are stored in Cloudflare R2, providing off-site redundancy and
disaster recovery capabilities.

## Backup Schedule Summary

| Layer            | Schedule               | Retention | Destination   |
| ---------------- | ---------------------- | --------- | ------------- |
| K3s etcd         | Daily at 1:00 AM       | 5 days    | Cloudflare R2 |
| Longhorn Volumes | Daily at 2:00 AM       | 7 days    | Cloudflare R2 |
| Velero Cluster   | Daily at 3:00 AM       | 14 days   | Cloudflare R2 |
| CloudNative PG   | Every 6 hours (4x/day) | 30 days   | Cloudflare R2 |

## Prerequisites: Cloudflare R2 Setup

Before configuring backups, you need a Cloudflare R2 bucket and API credentials:

1. **Create an R2 Bucket:**
   - In your Cloudflare dashboard, go to **R2** and click **Create bucket**
   - Give it a unique name (e.g., `k3s-backup-repository`)
   - Note your **S3 Endpoint URL** from the bucket's main page:
     `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

2. **Create R2 API Credentials:**
   - On the main R2 page, click **Manage R2 API Tokens**
   - Click **Create API Token**
   - Give it a name (e.g., `k3s-backup-token`) and grant it **Object Read &
     Write** permissions
   - Securely copy the **Access Key ID** and **Secret Access Key**

You'll need these credentials for all three backup layers.

## Why Four Layers?

Each backup layer serves a specific purpose:

- **etcd Snapshots**: Protect the Kubernetes control plane state (API objects,
  cluster configuration)
- **Longhorn Backups**: Protect persistent volume data independently of cluster
  state
- **Velero Backups**: Provide application-aware backups that capture both
  resources and volumes together
- **CloudNative PG Backups**: Provide PostgreSQL-consistent backups with
  point-in-time recovery capabilities

This multi-layer approach ensures you can recover from different types of
failures:

- Control plane corruption → Restore from etcd snapshot
- Volume data loss → Restore from Longhorn backup
- Complete cluster failure → Restore from Velero backup
- Database corruption/PITR → Restore from CloudNative PG backup

## Quick Links

- **[Setup etcd Snapshots](./k3s-backup-etcd)** - Configure control plane
  backups
- **[Setup Longhorn Backups](./k3s-backup-longhorn)** - Configure volume backups
- **[Setup Velero Backups](./k3s-backup-velero)** - Configure cluster backups
- **[Setup CloudNative PG Backups](./k3s-backup-cloudnative-pg)** - Configure
  PostgreSQL backups
- **[Disaster Recovery](./k3s-backup-disaster-recovery)** - Recovery procedures

## Monitoring and Maintenance

### Check Backup Status

**etcd Snapshots:**

```bash
sudo k3s etcd-snapshot list
```

**Longhorn Backups:**

```bash
kubectl get recurringjobs -n longhorn-system
kubectl get jobs -n longhorn-system
```

**Velero Backups:**

```bash
kubectl get schedules -n velero
velero backup get
```

**CloudNative PG Backups:**

```bash
kubectl get backups -n <postgres-namespace>
kubectl get cronjobs -n <postgres-namespace>
```

### Backup Health Checks

Regularly verify that backups are completing successfully:

1. **Check R2 bucket** for recent backup files
2. **Review Velero backup logs:**
   ```bash
   kubectl logs -n velero deployment/velero
   ```
3. **Check Longhorn backup jobs:**
   ```bash
   kubectl get jobs -n longhorn-system -l app=longhorn-manager
   ```

## References

- **[etcd Snapshots](./k3s-backup-etcd)** - Control plane backup documentation
- **[Longhorn Backups](./k3s-backup-longhorn)** - Volume backup documentation
- **[Velero Backups](./k3s-backup-velero)** - Cluster backup documentation
- **[CloudNative PG Backups](./k3s-backup-cloudnative-pg)** - PostgreSQL backup
  documentation
