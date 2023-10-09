# Kubernetes Learning Journey

## Objective

**Why**: To establish a strong foundational knowledge of Kubernetes and to set up a K3s cluster on Raspberry Pi units. The focus is to learn Kubernetes thoroughly and experiment with its various features.

**Goal**: By the end of this journey, aim to have the capability to rapidly instantiate new development environments and expose them to the external world with equal ease.

## Table of Contents
- [Introduction & Theoretical Foundations](#introduction--theoretical-foundations)
  - [What is Kubernetes](#1-what-is-kubernetes-🎥)
  - [Kubernetes Components Explained](#kubernetes-components-explained)
  - [Control Plane Components](#control-plane-components)
  - [Worker Node Components](#worker-node-components)
  - [Why Use Kubernetes](#2-why-use-kubernetes)
  - [Core Components and Concepts](#3-core-components-and-concepts)
  - [Read and Research](#5-read-and-research)
  - [Architecture Overview](#4-architecture-overview)
  - [Community and Ecosystem](#6-community-and-ecosystem)
- [Hardware](#hardware)
  - [Hardware Components](#hardware-components)
  - [Why These Choices?](#why-these-choices)
- [Setup](#setup)
  - [Raspberry Pi](#raspberry-pi)
    - [1. Flash SD Cards with Raspberry Pi OS](#1-flash-sd-cards-with-raspberry-pi-os)
    - [2. Initial Boot and Setup](#2-initial-boot-and-setup)
    - [3. Update and Upgrade](#3-update-and-upgrade)
    - [4. Assign Static IP Addresses](#4-assign-static-ip-addresses)
    - [5. Set SSH Aliases](#ssh-aliases)
    - [6. K3S Setup](#k3s-setup)
      - [Master Node](#master-node)
      - [Worker Nodes](#worker-nodes)
      - [Kubectl on local machine](#setup-kubectl-on-your-local-machine)
- [Basic Kubernetes Deployments](#basic-kubernetes-deployments)
  - [Namespace Setup](#namespace-setup)
  - [Basic Deployment](#basic-deployment)
  - [Service Exposure](#service-exposure)
  - [Verify Deployment](#verify-deployment)
  - [Cleanup](#cleanup-wiping-everything-and-starting-over)

---

## Introduction & Theoretical Foundations

#### [1. What is Kubernetes? 🎥](https://www.youtube.com/watch?v=TlHvYWVUZyc&ab_channel=ByteByteGo)
- Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications.

## Kubernetes Components Explained

### Control Plane Components

- **API Server**: 
  - Acts as the front-end for the Kubernetes control plane.

- **etcd**: 
  - Consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data.

- **Scheduler**: 
  - Responsible for scheduling pods onto nodes.

- **Controller Manager**: 
  - Runs controllers, which are background threads that handle routine tasks in the cluster.

### Worker Node Components

- **Worker Node**: 
  - Machines, VMs, or physical computers that run your applications.

- **Pods**: 
  - The smallest deployable units of computing that can be created and managed in Kubernetes.

- **kubelet**: 
  - An agent that runs on each worker node in the cluster and ensures that containers are running in a pod.

- **kube-proxy**: 
  - Maintains network rules on nodes, allowing network communication to your Pods from network sessions inside or outside of your cluster.



#### 2. Why Use Kubernetes?
- **Scaling**: Easily scale applications up or down as needed.
- **High Availability**: Ensure that your applications are fault-tolerant and highly available.
- **Portability**: Move workloads across different cloud providers or on-premises environments.
- **Declarative Configuration**: Describe what you want, and Kubernetes makes it happen.

#### 3. Core Components and Concepts
- **Control Plane**: The set of components that manage the overall state of the cluster.
- **Nodes**: The worker machines that run containers.
- **Pods**: The smallest deployable units that can contain one or more containers.
- **Services**: A way to expose Pods to the network.
- **Ingress**: Manages external access to services within a cluster.
- **ConfigMaps and Secrets**: Manage configuration data and secrets separately from container images.

#### 4. Architecture Overview
- **Bottom-Up View**: Understand Kubernetes from the infrastructure (Nodes) to Pods, to Services, and upwards.
- **Top-Down View**: Start from the user's perspective, breaking down what you want to deploy into services, pods, and the underlying infrastructure.

#### 5. Read and Research
- Go through [Kubernetes' official documentation](https://kubernetes.io/docs/home/).
- Watch [beginner-friendly YouTube tutorials](https://www.youtube.com/watch?v=d6WC5n9G_sM&ab_channel=freeCodeCamp.org) or online courses.

#### 6. Community and Ecosystem
- Get familiar with the wider Kubernetes ecosystem, including tooling, forums, and meetups.

---

## Hardware
### Hardware Components

The setup illustrated here is not mandatory but reflects my personal choices based on both experience and specific requirements. I aimed for a setup that is not only robust but also relatively mobile. Therefore, I opted for a 4U Rack where all the components are neatly encapsulated, making it easy to plug and play. I plan to expand this cluster by adding another four Raspberry Pis once the prices are more accommodating.

- **[Mikrotik RB3011UiAS-RM](https://mikrotik.com/product/RB3011UiAS-RM)**: I chose Mikrotik's router as it offers a professional-grade, feature-rich solution at an affordable price. This router allows for a myriad of configurations and functionalities that you'd typically find in higher-end solutions like Cisco. Its features like robust firewall options, VPN support, and advanced routing capabilities made it a compelling choice.

- **[4x Raspberry Pi 4 B 8GB](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)**: I opted for the 8GB variant of the Raspberry Pi 4 B for its performance capabilities. The 8GB RAM provides ample room for running multiple containers and allows for future scalability.

- **[4U Rack Cabinet](https://www.compumail.dk/en/p/lanberg-rack-gra-993865294)**: A 4U Rack to encapsulate all components cleanly. It provides the benefit of space efficiency and easy access for any hardware changes or additions.

- **[Rack Power Supply](https://www.compumail.dk/en/p/lanberg-pdu-09f-0300-bk-stromstodsbeskytter-9-stik-16a-sort-3m-996106700)**: A centralized power supply solution for the entire rack. Ensures consistent and reliable power distribution to all the components.

- **[GeeekPi 1U Rack Kit for Raspberry Pi 4B, 19" 1U Rack Mount](https://www.amazon.de/-/en/gp/product/B0972928CN/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: This 19 inch rack mount kit is specially designed for recording Raspberry Pi 4B boards and supports up to 4 units.

- **[SanDisk Extreme microSDHC 3 Rescue Pro Deluxe Memory Card, Red/Gold 64GB](https://www.amazon.de/-/en/gp/product/B07FCMBLV6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: Up to 160MB/s Read speed and 60 MB/s. Write speed for fast recording and transferring

- **[Vanja SD/Micro SD Card Reader](https://www.amazon.de/-/en/gp/product/B00W02VHM6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: Micro USB OTG Adapter and USB 2.0 Memory Card Reader

- **[deleyCON 5 x 0.25 m CAT8.1](https://www.amazon.de/-/en/gp/product/B08WPJVGHR/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1)**: deleyCON CAT 8.1 patch cable network cable as set // 2x RJ45 plug // S/FTP PIMF shielding

- **[CSL CAT.8 Network Cable 40 Gigabit](https://www.amazon.de/-/en/gp/product/B08FCLHTH5/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1)**: CSL CAT.8 Network Cable 40 Gigabit

### Why These Choices?

- **Mobility**: The 4U Rack allows me to move the entire setup easily, making it convenient for different scenarios, from a home office to a small business environment.
  
- **Professional-Grade Networking**: The Mikrotik router provides a rich feature set generally found in enterprise-grade hardware, offering me a sandbox to experiment with advanced networking configurations.
  
- **Scalability**: The Raspberry Pi units and the Rack setup are easily scalable. I can effortlessly add more Pis to the cluster, enhancing its capabilities.

- **Affordability**: This setup provides a balance between cost and performance, giving me a powerful Kubernetes cluster without breaking the bank.


---

# Setup

## Raspberry Pi

#### 1. Flash SD Cards with Raspberry Pi OS Using Pi Imager
- Open [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
  - Choose the 'OS' you want to install from the list. The tool will download the selected OS image for you.
  - Insert your SD card and select it in the 'Storage' section.
  - Before writing, click on the cog icon for advanced settings.
    - Set the hostname to your desired value, e.g., `RP1`.
    - Enable SSH and select the "allow public-key authorization only" option.
  - Click on 'Write' to begin the flashing process.
  
#### 2. Initial Boot and Setup
- Insert the flashed SD card into the Raspberry Pi and power it on.
- On the first boot, ssh into the Pi to perform initial configuration
  
#### 3. Update and Upgrade
- Run the following commands to update the package list and upgrade the installed packages:
```bash
sudo apt update
sudo apt upgrade
```
#### 4. Assign Static IP Addresses

##### MikroTik Router

- Open the MikroTik Web UI and navigate to `IP > DHCP Server`.
- Locate the `Leases` tab and identify the MAC addresses of your Raspberry Pi units.
- Click on the entry for each Raspberry Pi and change it from "dynamic" to "static".

##### Rasperry Pi

SSH into each Rasperry Pi to configure static IP by editing the `dhcpcd.conf` file:

```bash
sudo vi /etc/dhcpcd.conf
```

Add the following, adapting to your network configuration:

```bash
interface eth0
static ip_address=192.168.1.XX/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

* static `ip_address`: The static IP you want to assign to the Raspberry Pi.
* static `router`: The IP address of the default gateway (usually your router).
* static `domain_name_servers`: The IP address of the DNS server (can be the same as the gateway).

Save the file and exit, then restart the networking service:

```bash
sudo service dhcpcd restart
```

## Set SSH Aliases

Once you have assigned static IPs to your Raspberry Pis, you can simplify the SSH process by setting up SSH aliases. Here's how to do it:

1. **Open the SSH config file on your local machine:**

```bash
vi ~/.ssh/config
```
    
2. **Add the following entries for each Raspberry Pi:**

```bash
Host rp1
  HostName <Master_IP>
  User YOUR_USERNAME

Host rp2
  HostName <Worker1_IP>
  User YOUR_USERNAME

Host rp3
  HostName <Worker2_IP>
  User YOUR_USERNAME

Host rp4
  HostName <Worker3_IP>
  User YOUR_USERNAME
```

Replace `<Master_IP>`, `<Worker1_IP>`, `<Worker2_IP>`, and `<Worker3_IP>` with the actual static IP addresses of your Raspberry Pis.

3. **Save and Close the File**

5. **Test Your Aliases**

You should now be able to SSH into each Raspberry Pi using the alias:

```bash
ssh rp1
```

That's it! You've set up SSH aliases for your Raspberry Pi cluster.

## K3S Setup

### Master Node

1. **Enable Memory Cgroups**: 

```
Control Groups (Cgroups) are a Linux kernel feature that allows you to allocate resources such as CPU time, system memory, and more among user-defined groups of tasks (processes). K3s requires memory cgroups to be enabled to better manage and restrict the resources that each container can use. This is crucial in a multi-container environment where resource allocation needs to be as efficient as possible.

Simple Analogy: Imagine you live in a house with multiple people (processes), and there are limited resources like time (CPU), space (memory), and tools (I/O). Without a system in place, one person might hog the vacuum cleaner all day (CPU time), while someone else fills the fridge with their stuff (memory).

With a `"chore schedule"` (cgroups), you ensure everyone gets an allocated time with the vacuum cleaner, some space in the fridge, and so on. This schedule ensures that everyone can do their chores without stepping on each other's toes, much like how cgroups allocate system resources to multiple processes.
```

Before installing K3s, it's essential to enable memory cgroups on the Raspberry Pi for effective container resource management.

1. Edit the `/boot/cmdline.txt` file on your Raspberry Pi.
```bash
sudo vi /boot/cmdline.txt
```
    
2. Append the following to enable memory cgroups.
```text
cgroup_memory=1 cgroup_enable=memory
```
    
3. Save the file and reboot your Raspberry Pi.
```bash
sudo reboot
```

2. **Choose a Master Node**: Select one Raspberry Pi to act as the master node.

3. **Install K3s**: Use the following command to install K3s on the master node.
```bash
curl -sfL https://get.k3s.io | sh -
```

3. **Copy and Set Permissions for Kubeconfig**: To avoid permission issues when using kubectl, copy the generated Kubeconfig to your home directory and update its ownership.

```bash
# Create the .kube directory in the user's home directory if it doesn't already exist
mkdir -p ~/.kube

# Copy the k3s.yaml file from its default location to the user's .kube directory as the default kubectl config file
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config

# Change the ownership of the copied config file to the current user and group, so kubectl can access it without requiring sudo
sudo chown $(id -u):$(id -g) ~/.kube/config
```

4. **Verify Cluster**: Ensure that `/etc/rancher/k3s/k3s.yaml` was created and the cluster is accessible.
```bash
kubectl --kubeconfig ~/.kube/config get nodes
```
5. **Set KUBECONFIG Environment Variable**: To make it more convenient to run `kubectl` commands without having to specify the `--kubeconfig` flag every time, you can set an environment variable to automatically point to the kubeconfig file.
```bash
export KUBECONFIG=~/.kube/config
```
To make this setting permanent across shell sessions, add it to your shell profile:
    
- For Bash:
```bash
echo "export KUBECONFIG=~/.kube/config" >> ~/.bashrc
source ~/.bashrc
```

By doing this, you streamline your workflow, allowing you to simply run `kubectl get nodes` instead of specifying the kubeconfig path each time.

---

### Worker Nodes

1. **Join Tokens**: On the master node, retrieve the join token from `/var/lib/rancher/k3s/server/token`.

```bash
vi /var/lib/rancher/k3s/server/token
```
2. **Worker Installation**: Use this token to join each worker node to the master.

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<master_node_ip>:6443 K3S_TOKEN=<token> sh -
```

3. **Node Verification**: Check that all worker nodes have joined the cluster. On your master node, run:

```bash
kubectl get nodes
```

---

### Setup kubectl on your local machine

#### Kubeconfig

After setting up your cluster, it's more convenient to manage it remotely from your local machine. Here's how to do that:

1. **Create the `.kube` directory on your local machine if it doesn't already exist.**

```bash
mkdir -p ~/.kube
```

2. **Copy the kubeconfig from the master node to your local `.kube` directory.**

```bash
scp <user>@<master_node_ip>:~/.kube/config ~/.kube/config
```
Replace `<user>` with your username and `<master_node_ip>` with the IP address of your master node.

**Note**: If you encounter a permissions issue while copying, ensure that the `~/.kube/config` on your master node is owned by your user and is accessible. You might have to adjust file permissions or ownership on the master node accordingly.

3. **Update the kubeconfig server details (Optional)**

Open your local `~/.kube/config` and make sure the `server` IP matches your master node's IP. If it's set to `127.0.0.1`, you'll need to update it.

```yaml
server: https://<master_node_ip>:6443
```

Replace `<master_node_ip>` with the IP address of your master node.

After completing these steps, you should be able to run `kubectl` commands from your local machine to interact with your Kubernetes cluster. This avoids the need to SSH into the master node for cluster management tasks.

---
Absolutely, here's how your deployment guide could look, complete with explanations for each step:

Absolutely, preserving the depth is important for clarity. Here's an extended version of your guide, integrating the detailed explanations and the new cleanup section:

---

## Basic Kubernetes Deployments

### Namespace Setup

1. **Create a new Kubernetes Namespace**: 
- A Namespace is essentially a partition of the Kubernetes cluster. It allows you to logically isolate different environments (like dev, staging, and prod) within the same cluster. You can remove a namespace, which will also delete all resources within it.

```bash
kubectl create namespace my-apps
```

### Basic Deployment

2. **Deploy a Simple App**: 
- This command deploys an Nginx web server container in the namespace `my-apps`. Kubernetes wraps this container in a Pod and schedules it to run on one of the nodes.

 ```bash
kubectl create deployment hello-world --image=nginx --namespace=my-apps
 ```

### Service Exposure

3. **Expose the Deployment**: 
- Exposing the deployment creates a service of type `ClusterIP`. This makes the app accessible within the cluster but not from your local machine. A service of type ClusterIP gets a virtual IP address within the cluster, enabling communication between different services.

```bash
kubectl expose deployment hello-world --type=ClusterIP --port=80 --namespace=my-apps
```

### Verify Deployment

4. **Verify Using Port-Forward**: 
- The `port-forward` command forwards a local port to a port on the pod. The `8081:80` syntax maps local port 8081 to the pod's port 80. With this, you can access the application for testing directly from your local machine.

```bash
kubectl port-forward deployment/hello-world 8081:80 --namespace=my-apps
```

### Cleanup: Wiping Everything and Starting Over

- If you want to remove all the resources associated with this exercise for any reason (like wanting to start fresh), you can delete the namespace. This action will remove all resources within that namespace, including deployments, services, etc.

```bash
kubectl delete namespace my-apps
```

**Warning**: Deleting the namespace will remove all resources in that namespace. Ensure you're okay with that before running the command.