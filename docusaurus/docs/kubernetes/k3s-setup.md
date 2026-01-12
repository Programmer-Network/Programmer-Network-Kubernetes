---
title: K3S Installation
---

### Before You Start

Make sure you have:

- [x] [Set up your Raspberry Pis](../hardware-raspberry-pi-setup/raspberry-pi-setup.md)
- [x] [Set up your Mini-PCs (if any)](../hardware-raspberry-pi-setup/mini-pcs-setup.md)
- [x] [Configured your Network](../networking/mikrotik/network-overview.mdx)

Now, we are going to set up a Kubernetes cluster. You don't need to understand
what Kubernetes is at this point, just follow the steps and you'll be able to
use it. Once it's set up, you'll be able to deploy your applications and learn
more about how it works.

In this guide, we will set up a
[HA (High Availability)](https://en.wikipedia.org/wiki/High-availability_cluster)
cluster with 3 master nodes. If you are using different
[hardware](../hardware-raspberry-pi-setup/hardware.mdx), you can set up your
cluster accordingly. For example, if you are using a single machine (e.g., a
single Raspberry Pi, a single Mini-PC, etc.), you can set up a single master
node cluster.

The official K3S documentation also explains both:

- [Single Master Node](https://docs.k3s.io/quick-start)
- [High Availability Embedded etcd](https://docs.k3s.io/datastore/ha-embedded)

### Set Up the Master Node(s)

> **Note:** We disable the default installation of
> [Traefik](https://traefik.io/traefik/) because we will install it manually
> later using [Helm](https://helm.sh/). We also disable `servicelb` since we
> will use [MetalLB](https://metallb.io/) as our
> [load balancer](<https://en.wikipedia.org/wiki/Load_balancing_(computing)>).
> Don't worry much about those right now. You will learn more about what they
> are and how to use them later.

**Why Use DNS Names Instead of IPs?**

We use static DNS names (not raw IP addresses) for our nodes, as configured in
our
[Network Device Configuration](../networking/mikrotik/device-configuration.mdx).

If we use IP addresses directly when setting up K3S, and those IPs ever change
(for example, due to network reconfiguration or moving to a different subnet),
our cluster will likely break. This is because K3S (and Kubernetes in general)
embeds the node addresses, including in SSL certificates and cluster
configuration. Changing the IPs later would require us to tear down and
completely recreate the cluster, as the certificates and internal references
would no longer match.

By using DNS names that always resolve to the correct node, we can change the
underlying IPs in our network without having to rebuild our Kubernetes cluster.
The nodes will continue to find and trust each other as long as the DNS names
remain consistent.

Select one Raspberry Pi to act as the master node, and install K3S:

As you can see, we are using the static DNS names that we've set up in our
[Network Device Configuration](../networking/mikrotik/device-configuration.mdx).
This is really important to ensure that the nodes can communicate with each
other, also that we can have our cluster running even if the subnet changes in
the future.

```bash title="k3s-server-1.cluster"
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - server \
  --cluster-init \
  --disable servicelb \
  --disable traefik \
  --node-name k3s-server-1.cluster
```

If you have multiple master nodes (as in my case, with 3), run the following
command on each additional master node:

```bash title="k3s-server-2.cluster"
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - server \
  --server https://k3s-server-1.cluster:6443 \
  --disable servicelb \
  --disable traefik \
  --node-name k3s-server-2.cluster
```

```bash title="k3s-server-3.cluster"
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - server \
  --server https://k3s-server-1.cluster:6443 \
  --disable servicelb \
  --disable traefik \
  --node-name k3s-server-3.cluster
```

**Copy and Set Permissions for Kubeconfig:** To avoid permission issues when
using `kubectl`, copy the generated kubeconfig to your home directory and update
its ownership:

```bash title="Copy and Set Permissions for Kubeconfig"
# Create the .kube directory in your home directory if it doesn't already exist
mkdir -p ~/.kube

# Copy the k3s.yaml file from its default location to your .kube directory as the default kubectl config file
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config

# Change the ownership of the copied config file to the current user and group, so kubectl can access it without requiring sudo
sudo chown $(id -u):$(id -g) ~/.kube/config
```

> **Troubleshooting Tips:**
>
> - If `kubectl get nodes` hangs or fails, check that the K3S service is
>   running: `sudo systemctl status k3s`
> - If you see certificate or permission errors, double-check the ownership and
>   permissions of `~/.kube/config`.
> - Make sure your firewall allows traffic on port 6443 between nodes.

**Verify Cluster:** Ensure that `/etc/rancher/k3s/k3s.yaml` was created and the
cluster is accessible:

```bash title="Verify Cluster"
kubectl --kubeconfig ~/.kube/config get nodes
```

**Quick Cluster Health Check:**

```bash title="Quick Cluster Health Check"
kubectl get componentstatuses
kubectl get pods --all-namespaces
```

**Set KUBECONFIG Environment Variable:** To make it more convenient to run
`kubectl` commands without specifying the `--kubeconfig` flag every time, set an
environment variable to automatically point to the kubeconfig file:

```bash title="Set KUBECONFIG Environment Variable"
export KUBECONFIG=~/.kube/config
```

To make this setting permanent across shell sessions, add it to your shell
profile:

```bash title="Set KUBECONFIG Environment Variable"
echo "export KUBECONFIG=~/.kube/config" >> ~/.bashrc
source ~/.bashrc
```

This streamlines your workflow, allowing you to simply run `kubectl get nodes`
instead of specifying the kubeconfig path each time.

### Set Up Worker Nodes

[Ansible Playbook](/ansible/playbooks/join-worker-nodes-and-setup-kube-config.yml)

**Join Tokens:** On the master node, retrieve the join token from
`/var/lib/rancher/k3s/server/token`:

```bash title="Join Tokens"
vi /var/lib/rancher/k3s/server/token
```

**Worker Installation:** Use this token to join each worker node to the master:

```bash title="Worker Installation"
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - agent \
  --server https://k3s-server-1.cluster:6443 \
  --node-name k3s-worker-rp4.cluster

curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - agent \
  --server https://k3s-server-1.cluster:6443 \
  --node-name k3s-worker-hp.cluster

curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET_TOKEN_HERE sh -s - agent \
  --server https://k3s-server-1.cluster:6443 \
  --node-name k3-worker-lenovo.cluster
```

**Node Verification:** Check that all worker nodes have joined the cluster. On
your master node, run:

```bash title="Node Verification"
kubectl get nodes
```

### Set Up kubectl on Your Local Machine

#### Kubeconfig

After setting up your cluster, it's more convenient to manage it remotely from
your local machine.

Here's how to do that:

**Create the `.kube` directory on your local machine if it doesn't already
exist:**

```bash title="Create the .kube directory on your local machine"
mkdir -p ~/.kube
```

**Copy the kubeconfig from the master node to your local `.kube` directory:**

```bash title="Copy the kubeconfig from the master node to your local .kube directory"
scp <user>@<master_node_ip>:~/.kube/config ~/.kube/config
```

Replace `<user>` with your username and `<master_node_ip>` with the IP address
of your master node.

**Note:** If you encounter a permissions issue while copying, ensure that the
`~/.kube/config` on your master node is owned by your user and is accessible.
You might have to adjust file permissions or ownership on the master node
accordingly.

**Update the kubeconfig server details (Optional):**

Open your local `~/.kube/config` and make sure the `server` IP matches your
master node's IP. If it's set to `127.0.0.1`, you'll need to update it:

```yaml title="Update the kubeconfig server details"
server: https://<master_node_ip>:6443
```

Replace `<master_node_ip>` with the IP address of your master node.

After completing these steps, you should be able to run `kubectl` commands from
your local machine to interact with your Kubernetes cluster. This avoids the
need to SSH into the master node for cluster management tasks.
