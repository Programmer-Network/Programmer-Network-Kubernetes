---
title: K3S Installation
---

### Enable Memory Cgroups

[Ansible Playbook](../../../ansible/playbooks/enable-memory-groups.yml)

Before installing K3s, it's essential to enable memory cgroups on the Raspberry Pi for container resource management.


[Control Groups (Cgroups)](https://en.wikipedia.org/wiki/Cgroups) are a Linux kernel feature that allows you to allocate resources such as CPU time, system memory, and more among user-defined groups of tasks (processes). 

K3s requires memory cgroups to be enabled to better manage and restrict the resources that each container can use. This is crucial in a multi-container environment where resource allocation needs to be as efficient as possible.

**Simple Analogy**: Imagine you live in a house with multiple people (processes), and there are limited resources like time (CPU), space (memory), and tools (I/O). Without a system in place, one person might hog the vacuum cleaner all day (CPU time), while someone else fills the fridge with their stuff (memory). With a `"chore schedule"` (cgroups), you ensure everyone gets an allocated time with the vacuum cleaner, some space in the fridge, and so on. This schedule ensures that everyone can do their chores without stepping on each other's toes, much like how cgroups allocate system resources to multiple processes.

Edit the `/boot/firmware/cmdline.txt` file on your Raspberry Pi.

```bash
sudo vi /boot/firmware/cmdline.txt
```
    
Append the following to enable memory cgroups.

```text
cgroup_memory=1 cgroup_enable=memory
```
    
Save the file and reboot your Raspberry Pi.

```bash
sudo reboot
```

### Setup the Master Node 

Select one Raspberry Pi to act as the master node, and install K3S:

```bash
curl -sfL https://get.k3s.io | sh -
```

**Copy and Set Permissions for Kubeconfig**: To avoid permission issues when using kubectl, copy the generated Kubeconfig to your home directory and update its ownership.

```bash
# Create the .kube directory in the user's home directory if it doesn't already exist
mkdir -p ~/.kube

# Copy the k3s.yaml file from its default location to the user's .kube directory as the default kubectl config file
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config

# Change the ownership of the copied config file to the current user and group, so kubectl can access it without requiring sudo
sudo chown $(id -u):$(id -g) ~/.kube/config
```

**Verify Cluster**: Ensure that `/etc/rancher/k3s/k3s.yaml` was created and the cluster is accessible.

```bash
kubectl --kubeconfig ~/.kube/config get nodes
```

**Set KUBECONFIG Environment Variable**: To make it more convenient to run `kubectl` commands without having to specify the `--kubeconfig` flag every time, you can set an environment variable to automatically point to the kubeconfig file.

```bash
export KUBECONFIG=~/.kube/config
```

To make this setting permanent across shell sessions, add it to your shell profile:
    
```bash
echo "export KUBECONFIG=~/.kube/config" >> ~/.bashrc
source ~/.bashrc
```

By doing this, you streamline your workflow, allowing you to simply run `kubectl get nodes` instead of specifying the kubeconfig path each time.

### Setup Worker Nodes

[Ansible Playbook](../../../ansible/playbooks/join-worker-nodes-and-setup-kube-config.yml)

**Join Tokens**: On the master node, retrieve the join token from `/var/lib/rancher/k3s/server/token`.

```bash
vi /var/lib/rancher/k3s/server/token
```

**Worker Installation**: Use this token to join each worker node to the master.

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<master_node_ip>:6443 K3S_TOKEN=<token> sh -
```

**Node Verification**: Check that all worker nodes have joined the cluster. On your master node, run:

```bash
kubectl get nodes
```

### Setup kubectl on your local machine

#### Kubeconfig

After setting up your cluster, it's more convenient to manage it remotely from your local machine. 

Here's how to do that:

**Create the `.kube` directory on your local machine if it doesn't already exist.**

```bash
mkdir -p ~/.kube
```

**Copy the kubeconfig from the master node to your local `.kube` directory.**

```bash
scp <user>@<master_node_ip>:~/.kube/config ~/.kube/config
```
Replace `<user>` with your username and `<master_node_ip>` with the IP address of your master node.

**Note**: If you encounter a permissions issue while copying, ensure that the `~/.kube/config` on your master node is owned by your user and is accessible. You might have to adjust file permissions or ownership on the master node accordingly.

**Update the kubeconfig server details (Optional)**

Open your local `~/.kube/config` and make sure the `server` IP matches your master node's IP. If it's set to `127.0.0.1`, you'll need to update it.

```yaml
server: https://<master_node_ip>:6443
```

Replace `<master_node_ip>` with the IP address of your master node.

After completing these steps, you should be able to run `kubectl` commands from your local machine to interact with your Kubernetes cluster. This avoids the need to SSH into the master node for cluster management tasks.