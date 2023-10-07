# Kubernetes Learning Journey

## Objective

**Why**: To establish a strong foundational knowledge of Kubernetes and to set up a K3s cluster on Raspberry Pi units. The focus is to learn Kubernetes thoroughly and experiment with its various features.

**Goal**: By the end of this journey, aim to have the capability to rapidly instantiate new development environments and expose them to the external world with equal ease.

## Table of Contents
- [Introduction & Theoretical Foundations](#introduction--theoretical-foundations)
- [Hardware](#hardware)
  - [Hardware Components](#hardware-components)
  - [Why These Choices?](#why-these-choices)
- [Setup](#setup)
  - [Raspberry Pi](#raspberry-pi)
  - [Router](#network-level)
  - [Cluster](#cluster)
  - [Worker Node](#worker-node)
- [Basic Deployments](#basic-deployments)
- [Documentation & Wrap-Up](#documentation--wrap-up)

---

## Introduction & Theoretical Foundations
### Tasks

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
- Go through Kubernetes' official documentation.
- Watch beginner-friendly YouTube tutorials or online courses.

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

### Why These Choices?

- **Mobility**: The 4U Rack allows me to move the entire setup easily, making it convenient for different scenarios, from a home office to a small business environment.
  
- **Professional-Grade Networking**: The Mikrotik router provides a rich feature set generally found in enterprise-grade hardware, offering me a sandbox to experiment with advanced networking configurations.
  
- **Scalability**: The Raspberry Pi units and the Rack setup are easily scalable. I can effortlessly add more Pis to the cluster, enhancing its capabilities.

- **Affordability**: This setup provides a balance between cost and performance, giving me a powerful Kubernetes cluster without breaking the bank.


---

# Setup

## Raspberry Pi
### Tasks
- Flash SD cards with the OS (Raspberry Pi OS).
- Assign static IP addresses for each Raspberry Pi unit.
- Enable SSH on each Raspberry Pi.
- Optionally, set up SSH keys for password-less login.

## Network Level
### Tasks

#### 1. Assign Static IPs on MikroTik Router
- Open the MikroTik Web UI and navigate to `IP > DHCP Server`.
- Locate the `Leases` tab and identify the MAC addresses of your Raspberry Pi units.
- Click on the entry for each Raspberry Pi and change it from "dynamic" to "static".
- Assign a static IP address that is within your local network range but outside of the DHCP pool.

#### 2. Enable Port Forwarding for Master Node (Optional)
- If you plan to access the Kubernetes API server from outside your network, you'll need to set up port forwarding.
- Navigate to `IP > Firewall > NAT`.
- Add a new rule to forward the external port (e.g., 6443) to the internal IP and port of your master node.

#### 3. Configure Firewall Rules
- To add an extra layer of security, explicitly allow only the necessary ports between nodes.
- Navigate to `IP > Firewall > Filter Rules`.
- Add rules to allow traffic only on the ports that Kubernetes and your applications will use.

#### 4. VLAN Configuration (Advanced, Optional)
- If you want to segregate your Kubernetes traffic from other network traffic, consider setting up a VLAN.
- Navigate to `Interfaces > VLAN` and configure as needed.

#### 5. DNS Configuration
- If you plan to use domain names to access services in your cluster, add the DNS records in the MikroTik router.
- Navigate to `IP > DNS` and add static DNS entries if needed.

#### 6. Update Router Firmware
- To ensure that you are running the most stable and secure version of RouterOS, check for firmware updates.
- Navigate to `System > Packages` and update if necessary.

#### 7. Backup Router Configuration
- Once all configurations are complete and tested, backup the router configuration.
- Navigate to `Files` and create a backup.



## Cluster
### Tasks
- Choose one Raspberry Pi to be the master node.
- Install K3s on the master node using the following command:

```bash
  curl -sfL https://get.k3s.io | sh -
```

Verify that `/etc/rancher/k3s/k3s.yaml` was created and the cluster is accessible:

```bash
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get nodes
```

## Worker Node

### Tasks

Retrieve the join token from the master node:

```bash
cat /var/lib/rancher/k3s/server/token
```

Use the token to join each worker node to the master:

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<master_node_ip>:6443 K3S_TOKEN=<token> sh -
```

Verify that all worker nodes have joined the cluster:

```bash
kubectl get nodes
```

## Basic Deployments

### Tasks

Create a new Kubernetes namespace:

```bash
kubectl create namespace my-apps
```

Deploy a simple "Hello World" app or web server like Nginx:

```bash
kubectl run hello-world --image=nginx --port=80 --namespace=my-apps
```

Expose the deployment as a ClusterIP service:

```bash
kubectl expose deployment hello-world --type=ClusterIP --port=80 --namespace=my-apps
```
Verify the deployment using `port-forward`:

```bash
kubectl port-forward deployment/hello-world 8080:80 --namespace=my-apps
```
