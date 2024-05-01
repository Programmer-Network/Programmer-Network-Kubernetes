## Table of Contents

- [Updating K3S on the Nodes](#updating-k3s-on-the-nodes)

---

### Updating K3S on the Nodes

To update k3s on your Raspberry Pis, you can follow these steps:

1. **Backup your existing setup**: Always ensure you have backups, especially of your k3s server data and any critical configuration.

2. **Drain the node**: If you're updating one node at a time in a cluster, drain the node to safely remove it from the cluster during the update.

   ```bash
   kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
   ```

3. **Stop k3s service**: Before updating, stop the k3s service on the node.

   ```bash
   sudo systemctl stop k3s
   ```

4. **Update k3s**: Download and install the latest version of k3s on the Raspberry Pi. You can use the installation script provided by k3s for updating it as well.

   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```

5. **Start k3s service**: After the update, start the k3s service again.

   ```bash
   sudo systemctl start k3s
   ```

6. **Uncordon the node**: If you drained the node earlier, make it schedulable again by uncordoning it.

   ```bash
   kubectl uncordon <node-name>
   ```

7. **Verify the update**: Check the version of k3s to confirm the update was successful.

   ```bash
   k3s --version
   ```

8. **Repeat for other nodes**: If you have multiple Raspberry Pis, repeat these steps for each node.

Ensure each step is completed without errors before proceeding to the next. If managing multiple nodes, consider automating the process with scripts or using a configuration management tool like Ansible.

### Explanation

In the context of Kubernetes, "draining a node" involves safely evicting all the pods from the node so that it can be taken down for maintenance or updates. This is a critical step to ensure that the services continue to run smoothly on other nodes while one node is temporarily out of the cluster.

#### Draining a Node

When you drain a node, Kubernetes does the following:

- **Evicts pods**: All the pods that are not part of the Kubernetes system (i.e., user pods) are safely evicted. System pods and those marked with a `PodDisruptionBudget` that cannot tolerate a disruption may remain unless specified otherwise.
- **Prevents new pods from being scheduled**: While a node is drained, it is marked as unschedulable, which means no new pods will be scheduled onto the node until it is uncordoned.

The typical command to drain a node is:

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-local-data
```

Options used:

- `--ignore-daemonsets`: Allows the drain command to ignore DaemonSet-managed pods, which cannot be killed.
- `--delete-local-data`: Allows deleting pods with local storage, like EmptyDir volumes.

### Uncordoning a Node

Uncordoning a node reverses the draining process. This makes the node schedulable again, allowing Kubernetes to start placing new pods onto it as needed by the scheduler's normal behavior. This is done after maintenance or updates are completed and the node is ready to rejoin the cluster.

The command to uncordon a node is:

```bash
kubectl uncordon <node-name>
```

Draining is an essential tool for cluster maintenance and upgrades, helping minimize disruptions in a production environment by gracefully handling pod migrations.
