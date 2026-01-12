---
title: Node Management
---

## Overview

As your K3s cluster grows or hardware changes, you'll need to add, remove, or
replace nodes. This guide covers how to safely manage your cluster's node
lifecycle.

## Adding Nodes

### Adding a Control Plane Node (HA Cluster)

To add an additional control plane node to an existing HA cluster:

1. **Prepare the Node:**
   - Install the operating system
   - Configure network (DNS, static IP if needed)
   - Ensure node can reach existing cluster nodes

2. **Get the Cluster Token:**

   ```bash
   # On an existing control plane node
   sudo cat /var/lib/rancher/k3s/server/node-token
   ```

3. **Install K3s on New Node:**

   ```bash
   # Replace with your values
   curl -sfL https://get.k3s.io | K3S_TOKEN=<cluster-token> sh -s - server \
     --server https://<existing-server-ip>:6443 \
     --node-name <new-node-name>
   ```

4. **Verify Node Joined:**
   ```bash
   kubectl get nodes
   ```
   The new node should appear in the list with `Ready` status.

### Adding a Worker Node (Agent)

To add a worker node to your cluster:

1. **Prepare the Node:**
   - Install the operating system
   - Configure network
   - Ensure connectivity to control plane

2. **Get Required Information:**

   ```bash
   # On control plane node
   sudo cat /var/lib/rancher/k3s/server/node-token  # Agent token
   # Note the server URL (usually https://<server-ip>:6443)
   ```

3. **Install K3s Agent:**

   ```bash
   curl -sfL https://get.k3s.io | K3S_URL=https://<server-ip>:6443 K3S_TOKEN=<agent-token> sh -
   ```

4. **Verify Node Joined:**
   ```bash
   kubectl get nodes
   ```

## Removing Nodes

### Removing a Worker Node

1. **Drain the Node:**

   ```bash
   kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
   ```

   This safely evicts all pods from the node.

2. **Delete the Node:**

   ```bash
   kubectl delete node <node-name>
   ```

3. **Stop K3s on the Node:**

   ```bash
   # On the node being removed
   sudo systemctl stop k3s-agent  # For worker nodes
   # or
   sudo systemctl stop k3s  # If it was a server node
   ```

4. **Uninstall K3s (Optional):**
   ```bash
   # On the node
   /usr/local/bin/k3s-uninstall.sh  # For agent
   # or
   /usr/local/bin/k3s-killall.sh    # For server
   ```

### Removing a Control Plane Node (HA Cluster)

**Important:** In an HA cluster, ensure you maintain quorum. For a 3-node
cluster, you need at least 2 nodes running.

1. **Verify Cluster Health:**

   ```bash
   kubectl get nodes
   kubectl get pods -n kube-system | grep etcd
   ```

   Ensure other etcd nodes are healthy.

2. **Drain the Node:**

   ```bash
   kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
   ```

3. **Remove from etcd Cluster (if needed):**
   - For embedded etcd, the node should be automatically removed
   - Monitor etcd health after removal

4. **Delete the Node:**

   ```bash
   kubectl delete node <node-name>
   ```

5. **Stop and Uninstall on Node:**
   ```bash
   # On the node
   sudo systemctl stop k3s
   /usr/local/bin/k3s-killall.sh
   ```

## Replacing Nodes

### Replacing a Failed Node

When a node fails and needs replacement:

1. **Remove the Failed Node:**

   ```bash
   # If node is still accessible
   kubectl drain <failed-node-name> --ignore-daemonsets --delete-emptydir-data --force
   kubectl delete node <failed-node-name>
   ```

   If node is not accessible:

   ```bash
   # Force delete (use with caution)
   kubectl delete node <failed-node-name> --force --grace-period=0
   ```

2. **Prepare Replacement Node:**
   - Use same hostname if possible (or update DNS)
   - Configure with same network settings

3. **Add Replacement Node:**
   - Follow "Adding Nodes" procedure above
   - Use same node name if possible

4. **Verify Replacement:**
   ```bash
   kubectl get nodes
   kubectl get pods -A
   ```
   Ensure pods reschedule and cluster is healthy.

### Replacing Control Plane Node (HA)

1. **Ensure Quorum:**
   - Verify remaining control plane nodes are healthy
   - For 3-node cluster, need at least 2 nodes

2. **Remove Failed Node:**

   ```bash
   kubectl delete node <failed-node-name>
   ```

3. **Add Replacement:**
   - Follow "Adding Control Plane Node" procedure
   - Use same node name and configuration

4. **Verify etcd Health:**
   ```bash
   kubectl get pods -n kube-system | grep etcd
   # Should show expected number of etcd pods
   ```

## Node Labeling and Tainting

### Adding Labels

Labels help organize and select nodes:

```bash
# Add label to node
kubectl label nodes <node-name> <key>=<value>

# Example: Label node by type
kubectl label nodes k3s-worker-1.cluster node-type=worker
kubectl label nodes k3s-server-1.cluster node-type=control-plane
```

### Using Node Selectors

Use node selectors in pod specs to schedule on specific nodes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  nodeSelector:
    node-type: worker
  containers:
    - name: app
      image: nginx
```

### Tainting Nodes

Taints prevent pods from scheduling on nodes (unless they have matching
tolerations):

```bash
# Add taint
kubectl taint nodes <node-name> <key>=<value>:<effect>

# Example: Make node dedicated for specific workload
kubectl taint nodes k3s-worker-1.cluster dedicated=app:NoSchedule

# Remove taint
kubectl taint nodes <node-name> <key>-
```

**Taint Effects:**

- `NoSchedule`: Pods without toleration won't be scheduled
- `PreferNoSchedule`: Prefer not to schedule, but allow if needed
- `NoExecute`: Evict existing pods without toleration

### Adding Tolerations

To allow pods to schedule on tainted nodes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  tolerations:
    - key: 'dedicated'
      operator: 'Equal'
      value: 'app'
      effect: 'NoSchedule'
  containers:
    - name: app
      image: nginx
```

## Node Maintenance Mode

### Cordon/Uncordon

Temporarily prevent scheduling on a node:

```bash
# Prevent new pods from scheduling
kubectl cordon <node-name>

# Allow scheduling again
kubectl uncordon <node-name>
```

### Drain for Maintenance

Safely prepare node for maintenance:

```bash
# Drain node (evicts pods, marks unschedulable)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Perform maintenance...

# Make node schedulable again
kubectl uncordon <node-name>
```

## Node Configuration

### Viewing Node Configuration

```bash
# Get node details
kubectl get node <node-name> -o yaml

# Get node status
kubectl describe node <node-name>
```

### Updating Node Configuration

Most node configuration is done via K3s installation parameters. To change:

1. **Stop K3s:**

   ```bash
   sudo systemctl stop k3s
   ```

2. **Edit Configuration:**

   ```bash
   sudo nano /etc/rancher/k3s/config.yaml
   ```

3. **Restart K3s:**
   ```bash
   sudo systemctl start k3s
   ```

## Best Practices

1. **Always Drain Before Removal:**
   - Safely evict pods before removing nodes
   - Prevents data loss and service interruption

2. **Maintain Quorum (HA Clusters):**
   - Never remove nodes that would break etcd quorum
   - For 3-node cluster, always keep at least 2 nodes

3. **Use Consistent Naming:**
   - Use DNS names instead of IPs
   - Maintain consistent hostnames

4. **Label Nodes Appropriately:**
   - Use labels for organization
   - Helps with pod scheduling and management

5. **Monitor After Changes:**
   - Watch cluster health after node changes
   - Verify pods reschedule correctly

6. **Backup Before Major Changes:**
   - Take etcd snapshots before removing control plane nodes
   - Backup persistent volumes if needed

## Troubleshooting Node Issues

### Node Won't Join Cluster

1. **Check Network Connectivity:**

   ```bash
   ping <server-ip>
   telnet <server-ip> 6443
   ```

2. **Verify Token:**
   - Ensure token is correct
   - Check token hasn't expired

3. **Check Firewall:**
   - Ensure ports 6443, 10250 are open
   - Verify node can reach server

4. **Review Logs:**
   ```bash
   sudo journalctl -u k3s -n 100
   ```

### Node Shows as NotReady

1. **Check K3s Service:**

   ```bash
   sudo systemctl status k3s
   ```

2. **Verify Network:**
   - Check node can reach other nodes
   - Verify DNS resolution

3. **Check Resources:**
   - Verify sufficient disk space
   - Check memory availability

## Related Documentation

- [K3s Maintenance Overview](./k3s-maintenance) - Maintenance overview
- [Updating K3s](./k3s-maintenance-updates) - Node update procedures
- [Health Checks](./k3s-maintenance-health) - Node health verification
- [K3s Setup](./k3s-setup) - Initial cluster setup
