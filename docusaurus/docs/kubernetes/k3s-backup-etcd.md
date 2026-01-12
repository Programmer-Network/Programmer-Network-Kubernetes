---
title: K3s etcd Snapshots
---

## Overview

K3s uses an embedded etcd database to store cluster state. Regular snapshots
ensure you can recover the control plane in case of cluster failure. This layer
protects your Kubernetes API objects, cluster configuration, and control plane
state.

## Configuration

The etcd backup is configured via Ansible automation. The configuration is
stored in `/etc/rancher/k3s/config.yaml` on each control plane node:

```yaml
etcd-s3: true
etcd-s3-bucket: k3s-backup-repository
etcd-s3-folder: k3s-etcd-snapshots
etcd-s3-endpoint: '<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com'
etcd-s3-access-key: 'YOUR_R2_ACCESS_KEY_ID'
etcd-s3-secret-key: 'YOUR_R2_SECRET_ACCESS_KEY'
etcd-snapshot-schedule-cron: '0 1 * * *'
etcd-snapshot-retention: 5
```

### Configuration Parameters

- `etcd-s3`: Enable S3-compatible storage for etcd snapshots
- `etcd-s3-bucket`: Your Cloudflare R2 bucket name
- `etcd-s3-folder`: Folder path within the bucket for snapshots
- `etcd-s3-endpoint`: R2 endpoint URL
- `etcd-s3-access-key`: R2 access key ID
- `etcd-s3-secret-key`: R2 secret access key
- `etcd-snapshot-schedule-cron`: Cron expression for automatic snapshots
  (default: daily at 1:00 AM)
- `etcd-snapshot-retention`: Number of snapshots to retain (default: 5)

## Ansible Automation

If you use Ansible for automation, create a playbook to configure all master
nodes. Here's an example playbook structure:

```yaml
---
- name: Configure K3s server node
  hosts: master_nodes
  become: true
  tasks:
    - name: Ensure K3s config directory exists
      file:
        path: /etc/rancher/k3s
        state: directory
        owner: root
        group: root
        mode: '0755'

    - name: Place K3s config file with etcd backup settings
      copy:
        dest: /etc/rancher/k3s/config.yaml
        owner: root
        group: root
        mode: '0644'
        content: |
          etcd-s3: true
          etcd-s3-bucket: your-backup-bucket
          etcd-s3-folder: k3s-etcd-snapshots
          etcd-s3-endpoint: "<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com"
          etcd-s3-access-key: "YOUR_R2_ACCESS_KEY_ID"
          etcd-s3-secret-key: "YOUR_R2_SECRET_ACCESS_KEY"
          etcd-snapshot-schedule-cron: "0 1 * * *"
          etcd-snapshot-retention: 5

    - name: Restart K3s to apply configuration
      systemd:
        name: k3s
        state: restarted
```

Run the playbook:

```bash
ansible-playbook -i inventory.yml playbooks/etcd-cloudflare-r2.yaml --ask-become-pass
```

This playbook:

- Creates the `/etc/rancher/k3s` directory if it doesn't exist
- Places the configuration file with R2 credentials
- Restarts the k3s service to apply changes

### Manual Configuration

If you prefer to configure manually on each control plane node:

1. **Create the config directory:**

   ```bash
   sudo mkdir -p /etc/rancher/k3s
   ```

2. **Create the config file:**

   ```bash
   sudo nano /etc/rancher/k3s/config.yaml
   ```

3. **Add the configuration** (see Configuration section above)

4. **Restart k3s:**
   ```bash
   sudo systemctl restart k3s
   ```

## Manual Snapshot

You can trigger a manual snapshot at any time:

```bash
sudo k3s etcd-snapshot save
```

This creates an immediate snapshot and uploads it to your R2 bucket.

### Snapshot with Custom Name

```bash
sudo k3s etcd-snapshot save my-custom-snapshot-name
```

## Verification

1. **Check snapshot files in R2:**
   - Log into Cloudflare dashboard
   - Navigate to your R2 bucket
   - Check the `k3s-etcd-snapshots` folder for snapshot files

2. **List local snapshots:**

   ```bash
   sudo k3s etcd-snapshot list
   ```

3. **Check snapshot schedule:**
   ```bash
   sudo cat /etc/rancher/k3s/config.yaml | grep etcd-snapshot-schedule
   ```

## Restore from etcd Snapshot

To restore a cluster from an etcd snapshot:

### Prerequisites

- Fresh k3s installation (or cluster reset)
- Access to R2 bucket with snapshots
- R2 credentials

### Restore Procedure

1. **List available snapshots in R2:**
   - Check your Cloudflare R2 bucket
   - Note the snapshot file name

2. **On a fresh k3s installation, restore the snapshot:**

   ```bash
   sudo k3s server \
     --cluster-init \
     --etcd-s3 \
     --etcd-s3-bucket k3s-backup-repository \
     --etcd-s3-folder k3s-etcd-snapshots \
     --etcd-s3-endpoint "<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com" \
     --etcd-s3-access-key "YOUR_R2_ACCESS_KEY_ID" \
     --etcd-s3-secret-key "YOUR_R2_SECRET_ACCESS_KEY" \
     --cluster-reset-restore-path <snapshot-name>
   ```

3. **Verify cluster state:**
   ```bash
   sudo k3s kubectl get nodes
   sudo k3s kubectl get pods --all-namespaces
   ```

### Cluster Reset

If you need to reset the cluster to restore from a snapshot:

```bash
sudo k3s-killall.sh
sudo k3s-uninstall.sh
# Then reinstall and restore as shown above
```

## Troubleshooting

### Snapshot Not Created

1. **Verify k3s config:**

   ```bash
   sudo cat /etc/rancher/k3s/config.yaml
   ```

2. **Check k3s logs:**

   ```bash
   sudo journalctl -u k3s -f
   ```

3. **Test R2 connectivity:**
   - Verify R2 credentials are correct
   - Check network connectivity to R2 endpoint
   - Verify bucket exists and is accessible

### Snapshot Upload Fails

1. **Check R2 credentials:**
   - Verify access key and secret key are correct
   - Ensure the API token has Object Read & Write permissions

2. **Verify bucket configuration:**
   - Check bucket name matches configuration
   - Verify endpoint URL is correct

3. **Check network:**
   ```bash
   curl -I https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

### Snapshot Not Scheduled

1. **Verify cron expression:**

   ```bash
   sudo cat /etc/rancher/k3s/config.yaml | grep etcd-snapshot-schedule-cron
   ```

2. **Check k3s service status:**

   ```bash
   sudo systemctl status k3s
   ```

3. **Review k3s logs for snapshot activity:**
   ```bash
   sudo journalctl -u k3s | grep etcd-snapshot
   ```

## Best Practices

1. **Regular Testing**: Periodically test restoring from snapshots to ensure
   they work
2. **Monitor Retention**: Adjust retention based on your needs (default: 5
   snapshots)
3. **Secure Credentials**: Store R2 credentials securely, consider using Vault
4. **Document Snapshots**: Keep a log of important snapshots (e.g., before major
   upgrades)
5. **Multiple Buckets**: Consider separate buckets for different environments

## References

- **K3s etcd documentation**: https://docs.k3s.io/backup-restore
- **K3s backup guide**: https://docs.k3s.io/backup-restore/backup
