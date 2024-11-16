---
title: K3S Maintenance
---

### Steps for Updating K3S

Updating K3S involves safely taking each node offline (one at a time), performing the update, then bringing the node back into the cluster.

Before doing any updates, **backup your data**. Ensure you have backups of your K3S server data and important configuration files. This is especially crucial if something goes wrong during the update and you need to restore to a previous state.

### Draining the Node
When performing maintenance (such as updating K3S), it’s important to **"drain"** the node to protect your workloads and avoid interruptions. 

#### What Does "Draining" a Node Mean?
- **Draining** safely evicts all non-essential pods from the node, allowing Kubernetes to reschedule them on other nodes.
- It also makes the node "unschedulable," ensuring no new pods can be assigned to the node while it’s offline.

#### What does "evicting" a Pod Mean?

- In Kubernetes, "evicts" refers to the process of safely terminating Pods on a node, typically to free up resources or for maintenance, allowing them to be rescheduled on other nodes.

#### How to Drain a Node:
To drain a node, run the following command replacing `<node-name>` with the name of the node you want to update:

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

**Explanation of Command Options:**
- `--ignore-daemonsets`: Prevents Kubernetes from evicting system-critical pods managed by DaemonSets (these won't be touched).
- `--delete-emptydir-data`: Deletes any storage associated with `EmptyDir` volumes (used for temporary data in pods).

### Stopping the K3S Service

To update K3S, we first need to stop the running K3S service on the Raspberry Pi:

```bash
sudo systemctl stop k3s
```

This command stops K3S gracefully, which ensures everything halts correctly and there's no risk of corruption during the update.

### Updating K3S

Now, let's update K3S to its newest version. You can use the official K3S installation script to do this in a streamlined way. Running the script below will automatically detect the current installation and update it to the latest available version:

```bash
curl -sfL https://get.k3s.io | sh -
```

The script will download, install, and configure the latest version of K3S while keeping all your configurations in place.

### Starting the K3S Service Again

Once the update finishes, restart the K3S service on the node to bring it back online:

```bash
sudo systemctl start k3s
```

This will load the new K3S version and all services will resume.

### Uncordoning the Node

#### What Is "Uncordoning"?
After an update, we need to make the node available again for scheduling new pods, i.e., undo the "unschedulable" state created during the drain.

#### How to Uncordon a Node:
To let Kubernetes know this node is now ready to schedule new pods again:

```bash
kubectl uncordon <node-name>
```

This command marks the node as "schedulable," meaning new pods can now be assigned to it.

### Verifying the Update

Once the node is back online, verify the K3S version to confirm that the update was successful:

```bash
k3s --version
```

Check that the output shows the latest version installed.