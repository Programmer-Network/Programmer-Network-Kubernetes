---
title: K3S Backup
---

One of the most important lessons I’ve learned throughout my K3S journey, especially using Raspberry Pis, is the significance of performing regular backups.

Naturally, as you explore and learn, you'll inevitably break things. Often, this will be to the extent where you'll have to start all over again. While this might be frustrating, it's also an expected and even necessary part of the learning process. Repetition helps solidify knowledge, and you'll find yourself mastering certain tasks after doing them multiple times.

However, there will come a time when you've learned enough that some tasks no longer require repetition. At this point, having planned and reliable backups becomes invaluable. Rather than repeatedly starting from scratch, backups can restore your setup to a known good point, saving both time and effort.

Backups become absolutely essential when you're confident enough to run your setup in production. While we often think of High Availability (HA) configurations as the pinnacle of system reliability, things will inevitably still fail. Your hardware can fail, SSDs may die or become corrupted, and unforeseen issues will arise. In these scenarios, backups are the safety net you can rely on to quickly bring systems back online.

So, whether you’re running a learning environment on Raspberry Pis or a full production setup, backups are not just an option—they're a critical part of ensuring stability and business continuity. Systems will fail, but with proper backups, recovery doesn't have to be painful.

### How to Fully Backup a K3S Cluster

A K3S cluster consists not just of containerized workloads, but also a variety of critical data, including cluster state (stored in a database), persistent volumes, and configuration details (e.g., manifests and Helm charts). To ensure a complete backup, we need to address each of these areas.

### Back Up the K3S Database (etcd/SQLite)

The core of a Kubernetes (including K3S) cluster is the cluster state, which contains all the object definitions such as deployments, services, config maps, etc. K3S stores this information either in an embedded SQLite database (by default for single-node clusters) or in an external database like etcd (often used in HA, multi-master setups).

#### Single-Node K3S (SQLite) Backup

For a single-node setup where K3S uses its embedded SQLite database, you can simply copy the database file to back it up:

```bash
# Stop K3S service to avoid inconsistency
sudo systemctl stop k3s

# Copy the SQLite database to a backup location
sudo cp /var/lib/rancher/k3s/server/db/sqlite.db /backup/location/k3s-db-backup.sqlite

# Start K3S service again
sudo systemctl start k3s
```

> *Note*: Make sure that `/var/lib/rancher/k3s/server/db` is backed up in its entirety since this folder contains critical state data for K3S.

#### HA K3S Cluster (etcd) Backup:

For an HA K3S cluster, if you're using etcd as the K3S datastore, you'll need to back it up using the etcd backup tool. This allows you to capture a consistent database snapshot.

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert="/path/to/ca.crt" \
  --cert="/path/to/etcd-client.crt" \
  --key="/path/to/etcd-client.key" \
  snapshot save /backup/location/etcd-snapshot.db
```

This command will generate a backup file containing the entire state of your K3S cluster's etcd database.

#### **Embedded Dqlite (Alternative DB)**
If you're using Dqlite for HA purposes, you can back up the same way you would with SQLite because Dqlite is built on SQLite. K3S will automatically store the database in `/var/lib/rancher/k3s/server/db`.

### Backup Manifests and Helm Charts

#### Manifests (Static Pods) Backup

K3S supports static manifests, which are stored under `/var/lib/rancher/k3s/server/manifests`. These manifests describe services like CoreDNS, Traefik, etc., and K3S will automatically apply any changes to the files in this directory. Ensure this directory is included in your regular backup process:

```bash
sudo cp -R /var/lib/rancher/k3s/server/manifests /backup/location/  # For system manifests
sudo cp -R /var/lib/rancher/k3s/server/static /backup/location/     # For static components
```

#### **Helm Charts Backup:**
If you use Helm to manage applications on your K3S cluster, it’s important to backup the Helm charts. While Helm releases are stored in the cluster state, having a local copy of your Helm values files (especially custom configurations) is useful for re-deploying in case of failure. Keep a backup of the `values.yaml` files for each of your Helm deployments.

```bash
# Backup Helm values YAML files
cp /path/to/my-helm-chart-values.yaml /backup/location/
```

Backing up the complete `/chart` folder where your Helm configurations and values are stored ensures the quickest recovery in case of data loss.

### Backup Persistent Volumes

Many K3S workloads rely on persistent storage (PVs and PVCs) for storing critical data (e.g., databases, users’ data, etc.). You need to backup any persistent volumes regularly:

#### If using HostPath volumes (local folder storage)

```bash
# Copy the hostPath directories where PVs are stored
sudo cp -R /var/lib/rancher/k3s/storage/ /backup/location/
```

#### If using NFS or External Volumes

If your persistent volumes are stored on a networked storage (NFS) or an external volume provider like Longhorn, make sure to incorporate the backup process specified by the storage provider to keep this data safe. Many of these solutions offer snapshot capabilities that allow you to take consistent backups of persistent volumes while they are in use.

### Backup Certificates and Kubernetes Secrets

K3S generates its own certificates for internal Kubernetes API communication. These are located under `/var/lib/rancher/k3s/server/tls/`. You need to back this directory up to ensure your certificates can be restored or replaced if needed:

```bash
sudo cp -R /var/lib/rancher/k3s/server/tls/ /backup/location/
```

Additionally, consider exporting and backing up any Kubernetes secrets stored via `kubectl`. While these secrets are part of the cluster state stored in the database, it's still a good practice to have a backup:

```bash
kubectl get secret my-secret -o yaml --export > /backup/location/my-secret.yaml
```

### Automating the Backup Process

You don't want to manually perform all these steps every time. Set up periodic, automated backups using cron jobs and shell scripts to ensure consistency.

Here’s an example cron job for backing up a single-node sqlite DB every night at midnight:

```bash
# Edit your crontab
crontab -e

# Add this line for a nightly backup at midnight
0 0 * * * sudo cp /var/lib/rancher/k3s/server/db/sqlite.db /backup/location/k3s-db-backup.sqlite && sudo rsync -a /var/lib/rancher/k3s/server/tls/ /backup/location/tls-backup/ && sudo rsync -a /var/lib/rancher/k3s/storage/ /backup/location/storage-backup/
```

For multi-master etcd setups, a more complex script would be needed to handle database snapshots.

### Testing the Backup and Restore Process

The worst time to discover a flaw in your backup process is during a crisis. Once you've automated, **test** your backup and restore regularly:

- Spin up a fresh node or cluster.
- Restore the backup (etcd snapshots, SQLite DB, PVs, manifests).
- Ensure that the cluster recovers as expected and that all applications, services, and data are intact.