---
title: K3S Backup
---

## Backup and Restore for Single-Node K3s Cluster Using SQLite

[Ansible Playbook](/ansible/playbooks/backup-k3s.yml)

When working with a single-node K3s cluster, the default datastore is [SQLite](https://docs.k3s.io/datastore/backup-restore#backup-and-restore-with-sqlite), which is a lightweight, file-based database. Unfortunately, K3s does not provide specialized tools for backing up SQLite in single-node configurations.

In contrast, if you're running a multi-node (High Availability) cluster using etcd as the datastore, K3s offers a convenient [`k3s etcd-snapshot`](https://docs.k3s.io/cli/etcd-snapshot) command for backups and recovery. However, this tool is not applicable for single-node clusters where SQLite is the default datastore.

### Why Manually Back Up?

SQLite backups in K3s require manual steps because:

* SQLite is a simple, file-based database, so backing it up is as easy as copying key directories.
* K3s doesn't provide automatic backup utilities for this.

The good news is that manual backups are not too complicated. In this guide, we'll walk you through how to perform a manual backup and restore of K3s data using simple tools.

## Backup and Restore for Single-Node K3s (SQLite)

### Backup Process:

1. **Identify Critical Files**:

- SQLite Database: `/var/lib/rancher/k3s/server/db/`
- TLS Certificates: `/var/lib/rancher/k3s/server/tls/`
- Join Token: `/var/lib/rancher/k3s/server/token`

2. Create Backup Folder on Local Machine:

```bash
mkdir -p ~/k3s-backups/
```

3. Copy Files from K3s Server to Local Machine:

```bash
scp -r user@master_node:/var/lib/rancher/k3s/server/db ~/k3s-backups/
scp -r user@master_node:/var/lib/rancher/k3s/server/tls ~/k3s-backups/
scp user@master_node:/var/lib/rancher/k3s/server/token ~/k3s-backups/
```

4. (Optional) Compress the Backup:

```bash
tar -czf ~/k3s-backups/k3s-backup-$(date +%F_%T).tar.gz -C ~/k3s-backups db tls token
```

### Restore Process:

1. Stop K3s:

```bash
sudo systemctl stop k3s
```

2. Upload Backup from Local Machine to K3s Node:

```bash
scp -r ~/k3s-backups/db user@master_node:/var/lib/rancher/k3s/server/
scp -r ~/k3s-backups/tls user@master_node:/var/lib/rancher/k3s/server/
scp ~/k3s-backups/token user@master_node:/var/lib/rancher/k3s/server/
```

3. Ensure Correct Permissions:

```bash
sudo chown -R root:root /var/lib/rancher/k3s/server/db /var/lib/rancher/k3s/server/tls
sudo chown root:root /var/lib/rancher/k3s/server/token
sudo chmod 0600 /var/lib/rancher/k3s/server/token
```

4. Start K3s:

```bash
sudo systemctl start k3s
```

5. Verify Cluster Health:

```bash
kubectl get nodes
kubectl get pods --all-namespaces
```

### Summary:

- Backup: Copy `db/`, `tls/`, and `token` from `/var/lib/rancher/k3s/server/` to your local machine.

- Restore: Stop K3s, upload those files back to the node, ensure permissions, and start K3s again.

