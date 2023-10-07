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
  - [Router](#router)
  - [Cluster](#cluster)
  - [Worker Node](#worker-node)
- [Basic Deployments](#basic-deployments)

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

- **[GeeekPi 1U Rack Kit for Raspberry Pi 4B, 19" 1U Rack Mount](https://www.amazon.de/-/en/gp/product/B0972928CN/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: This 19 inch rack mount kit is specially designed for recording Raspberry Pi 4B boards and supports up to 4 units.

- **[SanDisk Extreme microSDHC 3 Rescue Pro Deluxe Memory Card, Red/Gold 64GB](https://www.amazon.de/-/en/gp/product/B07FCMBLV6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: Up to 160MB/s Read speed and 60 MB/s. Write speed for fast recording and transferring

- **[Vanja SD/Micro SD Card Reader](https://www.amazon.de/-/en/gp/product/B00W02VHM6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)**: Micro USB OTG Adapter and USB 2.0 Memory Card Reader

### Why These Choices?

- **Mobility**: The 4U Rack allows me to move the entire setup easily, making it convenient for different scenarios, from a home office to a small business environment.
  
- **Professional-Grade Networking**: The Mikrotik router provides a rich feature set generally found in enterprise-grade hardware, offering me a sandbox to experiment with advanced networking configurations.
  
- **Scalability**: The Raspberry Pi units and the Rack setup are easily scalable. I can effortlessly add more Pis to the cluster, enhancing its capabilities.

- **Affordability**: This setup provides a balance between cost and performance, giving me a powerful Kubernetes cluster without breaking the bank.


---

# Setup

## Raspberry Pi
### Tasks

#### 1. Flash SD Cards with Raspberry Pi OS
- Download the latest version of the Raspberry Pi OS (formerly Raspbian) from the [official website](https://www.raspberrypi.com/software/operating-systems/).
- Use a tool like [Balena Etcher](https://www.balena.io/etcher/) to flash the downloaded image onto the SD cards.
  
#### 2. Initial Boot and Setup
- Insert the flashed SD card into the Raspberry Pi and power it on.
- On the first boot, follow the on-screen setup steps if using a UI, or ssh into the Pi to perform initial configuration.
  
#### 3. Update and Upgrade
- Run the following commands to update the package list and upgrade the installed packages:
  ```bash
  sudo apt update
  sudo apt upgrade

#### 4. Assign Static IP Addresses

Edit the `dhcpcd.conf` file to assign a static IP:

```bash
sudo nano /etc/dhcpcd.conf
```

Add the following, adapting to your network configuration:

```
interface eth0
static ip_address=192.168.1.XX/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

#### 5. Enable SSH on Each Raspberry Pi

```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

#### 6. Optional: Set Up SSH Keys for Password-less Login

Generate SSH keys on your main machine (if you haven't already) using:

```bash
ssh-keygen
```

Copy the public key to each Raspberry Pi unit:

```bash
ssh-copy-id pi@<Raspberry_Pi_IP>
```


## Router
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

## Integrating Cloudflare Tunnel with K3S Kubernetes Cluster

### Overview

Using Cloudflare Tunnel with your K3S cluster allows you to expose your services to the internet securely. Cloudflare Tunnel routes your traffic through Cloudflare's global network, thereby adding an additional layer of security and network optimization.

### Prerequisites

- A K3S Kubernetes cluster up and running.
- A Cloudflare account and a domain managed by Cloudflare.

### Steps

#### 1. Install `cloudflared` on a Node

Install Cloudflare's `cloudflared` software on one of your Raspberry Pis. Here, we assume the master node for simplicity.

```bash
wget https://github.com/cloudflare/cloudflared/releases/download/.../cloudflared-linux-arm
chmod +x cloudflared-linux-arm
sudo mv cloudflared-linux-arm /usr/local/bin/cloudflared
```

#### 2. Authenticate cloudflared

```bash
cloudflared tunnel login
```

Follow the on-screen prompts to complete the authentication.

#### 3. Create a Cloudflare Tunnel

Create a new tunnel with your desired name.

```bash
cloudflared tunnel create <tunnel_name>
```

#### 4. Configure the Tunnel

Edit the `cloudflared` configuration file to route traffic from the tunnel to your K3S Ingress controller. The configuration might look like the following:

```yaml
tunnel: <tunnel_id>
credentials-file: /root/.cloudflared/<tunnel_id>.json

ingress:
  - hostname: your.domain.com
    service: http://localhost:80  # Point this to your Ingress Controller
  - service: http_status:404
```

#### 5. Run the Tunnel

Start the Cloudflare tunnel.

```bash
cloudflared tunnel run <tunnel_name>
```

#### 6. Configure Cloudflare DNS

Go to your Cloudflare dashboard and configure the DNS settings to point to the newly created tunnel.

#### 7. Kubernetes Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: your.domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80

```


## Cluster Setup

### Master Node

#### Tasks

1. **Choose a Master Node**: Select one Raspberry Pi to act as the master node.
2. **Install K3s**: Use the following command to install K3s on the master node.

    ```bash
    curl -sfL https://get.k3s.io | sh -
    ```

3. **Verify Cluster**: Ensure that `/etc/rancher/k3s/k3s.yaml` was created and the cluster is accessible.

    ```bash
    kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get nodes
    ```

### Worker Nodes

#### Tasks

##### Ansible Automation for Cluster Setup

Automating the setup of multiple Raspberry Pis can save time and ensure consistency. We'll use Ansible for this purpose.

###### Pre-requisites


#### Initial Minimal SSH Setup on Master Node

1. **Enable SSH on the master Raspberry Pi if not already enabled:**

```bash
sudo raspi-config
```
Navigate to `Interface Options > SSH` and enable it.

#### Ansible Installation on Master Node

1. **Update the package list and install prerequisites:**
```bash
sudo apt update
sudo apt install software-properties-common
```

2. **Add the Ansible PPA and install Ansible:**
```bash
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

3. **Verify Ansible installation:**
```bash
ansible --version
```

#### Optionally, Install `sshpass` for Initial SSH Authentication

1. **Install `sshpass`:**
```bash
sudo apt install sshpass
```

> **Note**: Detailed SSH setup, including copying public keys for password-less login, will be automated through Ansible.


###### Steps

1. **Generate an SSH Key on Master Node (Optional)**: This key can be used for password-less login to all worker nodes.

    ```bash
    ssh-keygen -t rsa
    ```

2. **Copy the Public Key to All Nodes (Optional)**: Replace `<worker_node_ip>` with the IP of each worker node.

    ```bash
    ssh-copy-id pi@<worker_node_ip>
    ```

3. **Create an Ansible Inventory File**: Create a `hosts.ini` file and populate it with your node details.

    ```ini
    [master]
    master ansible_host=<master_node_ip> ansible_user=pi

    [workers]
    worker1 ansible_host=<worker1_node_ip> ansible_user=pi
    worker2 ansible_host=<worker2_node_ip> ansible_user=pi
    ```

4. **Retrieve the K3s Join Token from Master Node**: Copy the token for use in the Ansible playbook.

    ```bash
    cat /var/lib/rancher/k3s/server/token
    ```

5. **Create an Ansible Playbook for Worker Node Setup**: Create a `setup-workers.yml` file.

    ```yaml
    ---
    - name: Setup K3s Workers
      hosts: workers
      become: yes
      vars:
        k3s_token: "<your_k3s_token_here>"
        k3s_master: "<master_node_ip_here>"
      tasks:
      - name: Join worker to K3s cluster
        shell: |
          curl -sfL https://get.k3s.io | K3S_URL=https://{{ k3s_master }}:6443 K3S_TOKEN={{ k3s_token }} sh -
    ```

6. **Run the Ansible Playbook**: Execute the playbook to join all worker nodes to the master node.

    ```bash
    ansible-playbook -i hosts.ini setup-workers.yml
    ```

7. **Verify Cluster**: Run the following command to make sure all nodes have joined the cluster.

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
