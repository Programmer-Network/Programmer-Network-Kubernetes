---
title: Updating K3s
---

## Overview

Updating K3s involves safely taking each node offline (one at a time),
performing the update, then bringing the node back into the cluster. This
process ensures your workloads remain available during the update.

## Pre-Update Checklist

Before starting any update, complete these steps:

1. **Backup Your Cluster**: Ensure you have recent backups of:
   - etcd snapshots (for control plane nodes)
   - Persistent volumes (via Longhorn or Velero)
   - Important configuration files

2. **Check Current Version**: Verify your current K3s version:

   ```bash
   k3s --version
   ```

3. **Review Release Notes**: Check the
   [K3s release notes](https://github.com/k3s-io/k3s/releases) for breaking
   changes or important updates.

4. **Plan Update Order**: For multi-node clusters:
   - Update worker nodes first (if you have any)
   - Then update control plane nodes one at a time
   - Always maintain quorum in HA setups (e.g., 2 out of 3 nodes available)

## Update Process

### Step 1: Drain the Node

When performing maintenance (such as updating K3s), it's important to
**"drain"** the node to protect your workloads and avoid interruptions.

#### What Does "Draining" a Node Mean?

- **Draining** safely evicts all non-essential pods from the node, allowing
  Kubernetes to reschedule them on other nodes.
- It also makes the node "unschedulable," ensuring no new pods can be assigned
  to the node while it's offline.

#### What Does "Evicting" a Pod Mean?

In Kubernetes, "evicting" refers to the process of safely terminating Pods on a
node, typically to free up resources or for maintenance, allowing them to be
rescheduled on other nodes.

#### How to Drain a Node

To drain a node, run the following command replacing `<node-name>` with the name
of the node you want to update:

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

**Explanation of Command Options:**

- `--ignore-daemonsets`: Prevents Kubernetes from evicting system-critical pods
  managed by DaemonSets (these won't be touched).
- `--delete-emptydir-data`: Deletes any storage associated with `EmptyDir`
  volumes (used for temporary data in pods).

**Example:**

```bash
kubectl drain k3s-server-1.cluster --ignore-daemonsets --delete-emptydir-data
```

Wait for the drain to complete. You should see output indicating that pods have
been evicted and the node is now unschedulable.

### Step 2: Stop the K3s Service

To update K3s, we first need to stop the running K3s service on the node:

```bash
sudo systemctl stop k3s
```

This command stops K3s gracefully, which ensures everything halts correctly and
there's no risk of corruption during the update.

### Step 3: Update K3s

Now, let's update K3s to its newest version. You can use the official K3s
installation script to do this in a streamlined way. Running the script below
will automatically detect the current installation and update it to the latest
available version:

```bash
curl -sfL https://get.k3s.io | sh -
```

**To Update to a Specific Version:**

If you need to update to a specific version (recommended for production), you
can specify the version:

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.28.5+k3s1 sh -
```

Replace `v1.28.5+k3s1` with your desired version. Check
[K3s releases](https://github.com/k3s-io/k3s/releases) for available versions.

The script will download, install, and configure the new version of K3s while
keeping all your configurations in place.

### Step 4: Start the K3s Service

Once the update finishes, restart the K3s service on the node to bring it back
online:

```bash
sudo systemctl start k3s
```

This will load the new K3s version and all services will resume.

### Step 5: Verify the Service Started

Check that K3s started successfully:

```bash
sudo systemctl status k3s
```

You should see `Active: active (running)`. If there are any errors, check the
logs:

```bash
sudo journalctl -u k3s -f
```

### Step 6: Uncordon the Node

#### What Is "Uncordoning"?

After an update, we need to make the node available again for scheduling new
pods, i.e., undo the "unschedulable" state created during the drain.

#### How to Uncordon a Node

To let Kubernetes know this node is now ready to schedule new pods again:

```bash
kubectl uncordon <node-name>
```

This command marks the node as "schedulable," meaning new pods can now be
assigned to it.

**Example:**

```bash
kubectl uncordon k3s-server-1.cluster
```

### Step 7: Verify the Update

Once the node is back online, verify the K3s version to confirm that the update
was successful:

```bash
k3s --version
```

Check that the output shows the new version installed.

Also verify the node is ready:

```bash
kubectl get nodes
```

You should see the node status as `Ready`.

## Post-Update Verification

After updating all nodes, perform these checks:

1. **Check All Nodes Are Ready:**

   ```bash
   kubectl get nodes
   ```

2. **Verify Cluster Components:**

   ```bash
   kubectl get pods -A
   ```

   Ensure all system pods are running.

3. **Test Application Functionality:**
   - Access your applications
   - Verify services are responding
   - Check ingress routing

4. **Monitor for Issues:**
   - Watch logs for errors: `kubectl logs -n <namespace> <pod-name>`
   - Check resource usage: `kubectl top nodes`
   - Monitor for 24-48 hours after updates

## Updating Worker Nodes

If you have worker nodes (agents), the process is similar but uses the agent
installation script:

1. Drain the worker node
2. Stop the K3s agent service: `sudo systemctl stop k3s-agent`
3. Update using the agent script:
   ```bash
   curl -sfL https://get.k3s.io | K3S_URL=https://<server-ip>:6443 K3S_TOKEN=<token> sh -
   ```
4. Start the service: `sudo systemctl start k3s-agent`
5. Uncordon the node

## Troubleshooting Update Issues

### Node Won't Start After Update

1. Check service status: `sudo systemctl status k3s`
2. Review logs: `sudo journalctl -u k3s -n 100`
3. Verify configuration files in `/etc/rancher/k3s/`
4. Check for certificate issues: `kubectl get nodes` should show the node

### Pods Not Scheduling After Uncordon

1. Check node conditions: `kubectl describe node <node-name>`
2. Verify node has resources:
   `kubectl describe node <node-name> | grep -A 5 "Allocated resources"`
3. Check for taints: `kubectl describe node <node-name> | grep Taints`

### Cluster Connectivity Issues

1. Verify network connectivity between nodes
2. Check firewall rules
3. Verify DNS resolution for node names
4. Review etcd health (for HA clusters)

## Related Documentation

- [K3s Maintenance Overview](./k3s-maintenance) - Other maintenance tasks
- [Health Checks](./k3s-maintenance-health) - Post-update health verification
- [Troubleshooting](./k3s-maintenance-troubleshooting) - Resolving update issues
- [Backup Strategy](./k3s-backup) - Pre-update backup procedures
