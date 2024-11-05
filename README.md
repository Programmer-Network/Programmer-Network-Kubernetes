# Kubernetes Learning Journey

<p align="center">
  <img src="./assets/images/kubernetes.png" style="width: 500px;">
</p>

## Objective

**Why**: To establish a strong foundational knowledge of Kubernetes and to set up a K3s cluster on Raspberry Pi units. The focus is to learn Kubernetes thoroughly and experiment with its various features.

**Goal**: By the end of this journey, aim to have the capability to rapidly instantiate new development and production environments and expose them to the external world with equal ease.

## Table of Contents
- [Hardware](#hardware)
  - [Hardware Components](#hardware-components)
  - [Why These Choices?](#why-these-choices)
- [Raspberry Pi's Setup](#raspberry-pis-setup)
  - [Flash SD Cards with Raspberry Pi OS](#flash-sd-cards-with-raspberry-pi-os-using-pi-imager)
  - [Initial Boot and Setup](#initial-boot-and-setup)
  - [Update and Upgrade](#update-and-upgrade---ansible-playbook)
  - [Disable Wi-Fi](#disable-wi-fi-ansible-playbook)
  - [Disable Swap](#disable-swap-ansible-playbook)
  - [Disable Bluetooth](#disable-bluetooth)
  - [Assign Static IP Addresses](#assign-static-ip-addresses)
  - [Set SSH Aliases](#set-ssh-aliases)

- [Kubernetes](#kubernetes)
  - [What is Kubernetes](#1-what-is-kubernetes-)
  - [Kubernetes Components Explained](#kubernetes-components-explained)
  - [Control Plane Components](#control-plane-components)
  - [Worker Node Components](#worker-node-components)
  - [Why Use Kubernetes](#2-why-use-kubernetes)
  - [Core Components and Concepts](#3-core-components-and-concepts)
  - [Read and Research](#5-read-and-research)
  - [Architecture Overview](#4-architecture-overview)
  - [Community and Ecosystem](#6-community-and-ecosystem)
  
- [K3S Setup](#k3s-setup)
  - [Enable Memory CGroups](#enable-memory-cgroups-ansible-playbook)
  - [Master Node](#setup-the-master-node)
  - [Worker Nodes](#setup-worker-nodes)
  - [Kubectl on local machine](#setup-kubectl-on-your-local-machine)

- [Getting Started with Kubernetes](#gettting-started-with-kubernetes)
  - [Namespace Setup](#namespace-setup)
  - [Basic Deployment](#basic-deployment)
  - [Service Exposure](#service-exposure)
  - [Verify Deployment](#verify-deployment)
  - [Cleanup](#cleanup-wiping-everything-and-starting-over)
  - [Basic Kubernetes Deployments](#basic-kubernetes-deployments)

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

- **[2x Verbatim Vi550 S3 SSD](https://www.amazon.de/dp/B07LGKQLT5?ref=ppx_yo2ov_dt_b_fed_asin_title&th=1)**

- **[2x JSAUX USB 3.0 to SATA Adapter](https://www.amazon.de/dp/B086W944YT?ref=ppx_yo2ov_dt_b_fed_asin_title)**



### Why These Choices?

**Mobility**: The 4U Rack allows me to move the entire setup easily, making it convenient for different scenarios, from a home office to a small business environment.
  
**Professional-Grade Networking**: The Mikrotik router provides a rich feature set generally found in enterprise-grade hardware, offering me a sandbox to experiment with advanced networking configurations.
  
**Scalability**: The Raspberry Pi units and the Rack setup are easily scalable. I can effortlessly add more Pis to the cluster, enhancing its capabilities.

**Affordability**: This setup provides a balance between cost and performance, giving me a powerful Kubernetes cluster without breaking the bank.


---


# Raspberry Pi's Setup

For most steps, an [Ansible playbook](./ansible/playbooks/) is available. However, I strongly recommend that you initially set up the first Raspberry Pi manually. This hands-on approach will help you understand each step more deeply and gain practical experience. Once you've completed the manual setup, you can then use the [Ansible playbook](./ansible/playbooks/) to automate the same tasks across the other devices.

#### Flash SD Cards with Raspberry Pi OS Using Pi Imager
- Open [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
  - Choose the 'OS' you want to install from the list. The tool will download the selected OS image for you.
  - Insert your SD card and select it in the 'Storage' section.
  - Before writing, click on the cog icon for advanced settings.
    - Set the hostname to your desired value, e.g., `RP1`.
    - Enable SSH and select the "allow public-key authorization only" option.
  - Click on 'Write' to begin the flashing process.
  
#### Initial Boot and Setup
- Insert the flashed SD card into the Raspberry Pi and power it on.
- On the first boot, ssh into the Pi to perform initial configuration
  
#### Update and Upgrade - ([Ansible Playbook](./ansible/playbooks/apt-update.yml))
- Run the following commands to update the package list and upgrade the installed packages:

```bash
sudo apt update
sudo apt upgrade
```

#### Disable Wi-Fi ([Ansible Playbook](./ansible/playbooks/disable-wifi.yml))

```sh
sudo vi /etc/wpa_supplicant/wpa_supplicant.conf
```

Add the following lines to the file:

```sh
network={
    ssid=""
    key_mgmt=NONE
}
```

Disable the Wi-Fi interface:

```sh
sudo ifconfig wlan0 down
```

Block the Wi-Fi module using `rfkill`:

```sh
sudo rfkill block wifi
```

Prevent the Wi-Fi module from loading at boot:

```sh
sudo nano /etc/modprobe.d/raspi-blacklist.conf
```

Add the following line:

```sh
blacklist brcmfmac
```

Reboot your Raspberry Pi:

```sh
sudo reboot
```

#### Disable Swap ([Ansible Playbook](./ansible/playbooks/disable-swap.yml))

Disabling swap in a K3s cluster is crucial because Kubernetes relies on precise memory management to allocate resources, schedule workloads, and handle potential memory limits. When swap is enabled, it introduces unpredictability in how memory is used. The Linux kernel may move inactive memory to disk (swap), giving the impression that there is available memory when, in reality, the node might be under significant memory pressure. This can lead to performance degradation for applications, as accessing memory from the swap space (on disk) is significantly slower than accessing it from RAM. In addition, Kubernetes, by default, expects swap to be off and prevents the kubelet from running unless explicitly overridden, as swap complicates memory monitoring and scheduling.

Beyond performance, swap interferes with Kubernetes' ability to react to out-of-memory (OOM) conditions. With swap enabled, a node might avoid crashing but at the cost of drastically reduced performance, disk I/O bottlenecks, and inconsistent resource allocation. In contrast, with swap disabled, Kubernetes can correctly identify memory shortages and kill misbehaving pods in a controlled way, allowing the system to recover predictably. For edge cases like K3s, which often operate on lightweight and resource-constrained systems (e.g., Raspberry Pis or IoT devices), disabling swap ensures efficient and stable operation without unnecessary disk wear and performance hits.

- Open a terminal.
- Run the following command to turn off swap for the current session:

```bash
sudo swapoff -a
```

This command disables the swap immediately, but it will be re-enabled after a reboot unless further steps are taken.

##### Modify `/etc/dphys-swapfile` to Disable Swap Permanently

Open the swap configuration file `/etc/dphys-swapfile` in a text editor:

```bash
sudo nano /etc/dphys-swapfile
```

Search for the line starting with `CONF_SWAPSIZE=`.
Modify that line to read:

```bash
CONF_SWAPSIZE=0
```

Save (Ctrl+O in `nano`) and exit the editor (Ctrl+X in `nano`).

#####  Remove the Existing Swap File

Run the following command to remove the current swap file (`/var/swap`):

```bash
sudo rm /var/swap
```

##### Stop the `dphys-swapfile` service immediately

Stop the `dphys-swapfile` service, which manages swap:
```bash
sudo systemctl stop dphys-swapfile
```

##### Disable the `dphys-swapfile` service to prevent it from running on boot

Prevent the `dphys-swapfile` service from starting during system boot by disabling it:

```bash
sudo systemctl disable dphys-swapfile
```

---

##### Verify swap is turned off

Run the following command to verify that swap is no longer in use:

```bash
free -m
```

In the output, ensure that the "Swap" line shows `0` for total, used, and free space:

```
total used free shared buffers cached
Mem: 2003 322 1681 18 12 129
-/+ buffers/cache: 180 1822
Swap: 0 0 0
```

---

##### Reboot the system

Finally, reboot the system in order to apply all changes fully and ensure swap remains permanently disabled:

```bash
sudo reboot
```

After the system comes back online, run `free -m` again to confirm that swap is still disabled.


#### Disable Bluetooth

When using Raspberry Pi devices in a Kubernetes-based environment like K3s, any unused hardware features, such as Bluetooth, can consume system resources or introduce potential security risks. Disabling Bluetooth on each Raspberry Pi optimizes performance by reducing background services and freeing up resources like CPU and memory. Additionally, by disabling an unused service, you reduce the attack surface of your Raspberry Pi-based K3s cluster, providing a more secure and streamlined operating environment.


##### Stop and disable the bluetooth service

**Stop the Bluetooth service** that might be currently running on your Raspberry Pi:

```bash
sudo systemctl stop bluetooth
```
   
**Disable the service** so it doesn't start automatically during system boot:

```bash
sudo systemctl disable bluetooth
```

This ensures that the Bluetooth service is not running in the background, conserving system resources.

##### Blacklist bluetooth kernel modules

To prevent the operating system from loading Bluetooth modules at boot time, you'll need to blacklist specific modules.

**Open the blacklist configuration file for editing (or create it)**:

```bash
sudo nano /etc/modprobe.d/raspi-blacklist.conf
```

**Add the following lines to disable Bluetooth modules**:

```bash
blacklist btbcm      # Disables Broadcom Bluetooth module
blacklist hci_uart   # Disables hci_uart module specific to Raspberry Pi Bluetooth
```

**Save the file** (Ctrl+O in `nano`) and **exit** the editor (Ctrl+X in `nano`).

By blacklisting these modules, they won’t be loaded during boot, effectively preventing Bluetooth from running.

##### Disable bluetooth in the system configuration

Bluetooth can be disabled directly at the device level by editing specific Raspberry Pi system configurations.

**Open the boot configuration file for editing**:

```bash
sudo nano /boot/config.txt
```

**Add the following line to disable Bluetooth**:

```bash
dtoverlay=disable-bt
```

Ensure no Bluetooth device can wake up your Raspberry Pi by ensuring the line is not commented out.

**Save the changes** (Ctrl+O in `nano`) and **exit** the editor (Ctrl+X in `nano`).

This command ensures that the Raspberry Pi doesn’t enable Bluetooth at boot by making system-wide firmware adjustments.

**Reboot the Raspberry Pi**

To fully apply the changes (stopping the service, blacklisting modules, and adjusting system configuration), it’s recommended to reboot the system.

**Reboot the Raspberry Pi**:

```bash
sudo reboot
```

After rebooting, you can verify that Bluetooth has been disabled by checking the status of the service:
   
```bash
sudo systemctl status bluetooth
```

It should indicate that the Bluetooth service is inactive or dead.


#### Assign Static IP Addresses

##### MikroTik Router

- Open the MikroTik Web UI and navigate to `IP > DHCP Server`.
- Locate the `Leases` tab and identify the MAC addresses of your Raspberry Pi units.
- Click on the entry for each Raspberry Pi and change it from "dynamic" to "static".

## Set SSH Aliases

Once you have assigned static IPs on your router, you can simplify the SSH process by setting up SSH aliases. Here's how to do it:

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

# Kubernetes

## What is Kubernetes? 🎥
- [Kubernetes Explained in 6 Minutes | k8s Architecture](https://www.youtube.com/watch?v=TlHvYWVUZyc&ab_channel=ByteByteGo)
- [Kubernetes Explained in 15 Minutes](https://www.youtube.com/watch?v=r2zuL9MW6wc)
- Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications.

### Kubernetes Components Explained

#### Control Plane Components

- **API Server**: 
  - Acts as the front-end for the Kubernetes control plane.

- **etcd**: 
  - Consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data.

- **Scheduler**: 
  - Responsible for scheduling pods onto nodes.

- **Controller Manager**: 
  - Runs controllers, which are background threads that handle routine tasks in the cluster.

#### Worker Node Components

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

## K3S Setup

### Enable Memory Cgroups ([Ansible Playbook](./ansible/playbooks/enable-memory-groups.yml))

```txt
Control Groups (Cgroups) are a Linux kernel feature that allows you to allocate resources such as CPU time, system memory, and more among user-defined groups of tasks (processes). K3s requires memory cgroups to be enabled to better manage and restrict the resources that each container can use. This is crucial in a multi-container environment where resource allocation needs to be as efficient as possible.

Simple Analogy: Imagine you live in a house with multiple people (processes), and there are limited resources like time (CPU), space (memory), and tools (I/O). Without a system in place, one person might hog the vacuum cleaner all day (CPU time), while someone else fills the fridge with their stuff (memory).

With a `"chore schedule"` (cgroups), you ensure everyone gets an allocated time with the vacuum cleaner, some space in the fridge, and so on. This schedule ensures that everyone can do their chores without stepping on each other's toes, much like how cgroups allocate system resources to multiple processes.
```

Before installing K3s, it's essential to enable memory cgroups on the Raspberry Pi for effective container resource management.

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

---

### Setup Worker Nodes

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

---

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

---

# Gettting Started with Kubernetes

## Namespace Setup

1. **Create a new Kubernetes Namespace**:

**Command:**
```bash
kubectl create namespace my-apps
```

**YAML Version**: `namespace.yaml`

```yaml
# Define the API version and the kind of resource
apiVersion: v1
kind: Namespace
metadata:
  # The name of the Namespace
  name: my-apps
 ```
**Apply with:**

```bash
kubectl apply -f namespace.yaml
```

## Basic Deployment

2. **Deploy a Simple App**: 

**Command:**

```bash
kubectl create deployment hello-world --image=nginx --namespace=my-apps
```

**YAML Version**: `deployment.yaml`

```yaml
# Define the API version and the kind of resource
apiVersion: apps/v1
kind: Deployment
metadata:
  # The name of the Deployment
  name: hello-world
  # Namespace to deploy into
  namespace: my-apps
spec:
  # Number of replica Pods to maintain
  replicas: 1
  selector:
    # Labels to match against when selecting Pods for this Deployment
    matchLabels:
      app: hello-world
  template:
    metadata:
      # Labels to assign to the Pods spawned by this Deployment
      labels:
        app: hello-world
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            # Container port that needs to be exposed
            - containerPort: 80

```
**Apply with:**

```bash
kubectl apply -f deployment.yaml
```

## Service Exposure

3. **Expose the Deployment**: 

**Command:**

```bash
kubectl expose deployment hello-world --type=ClusterIP --port=80 --namespace=my-apps
```

**YAML Version**: `service.yaml`

```yaml
# Define the API version and the kind of resource
apiVersion: v1
kind: Service
metadata:
  # Name of the Service
  name: hello-world
   # Namespace to create the service in
  namespace: my-apps
spec:
  # Select Pods with this label to expose via the Service
  selector:
    app: hello-world
  ports:
    - protocol: TCP
      # Expose the Service on this port
      port: 80
      # Map the Service port to the target Port on the Pod
      targetPort: 80
  # The type of Service; ClusterIP makes it reachable only within the cluster
  type: ClusterIP

```
**Apply with:**
```bash
kubectl apply -f service.yaml
```

## Verify Deployment

4. **Verify Using Port-Forward**: 

```bash
# This is only needed if service type is ClusterIP
kubectl port-forward deployment/hello-world 8081:80 --namespace=my-apps
```

## Cleanup: Wiping Everything and Starting Over

**Remove All Resources**:

```bash
kubectl delete namespace my-apps
```
**Or remove individual resources with:**

```bash
kubectl delete -f <filename>.yaml
```

**Warning**: Deleting the namespace will remove all resources in that namespace. Ensure you're okay with that before running the command.

---

## Exercises

### Exercise 1: Create and Examine a Pod

1. Create a simple Pod running Nginx.

```bash
kubectl run nginx-pod --image=nginx --restart=Never
```
    
2. Examine the Pod.

```bash
kubectl describe pod nginx-pod
```
    
3. Delete the Pod.

```bash
kubectl delete pod nginx-pod
```

**Objective**: Familiarize yourself with the Pod lifecycle.

---

### Exercise 2: Create a Deployment

1. Create a Deployment for a simple Node.js app (You can use a Docker image like `node:20`).

```bash
kubectl create deployment node-app --image=node:20
```

2. Scale the Deployment.

```bash
kubectl scale deployment node-app --replicas=3
```

3. Rollback the Deployment.

```bash
kubectl rollout undo deployment node-app
```

**Objective**: Learn how to manage application instances declaratively using Deployments.

---

### Exercise 3: Expose the Deployment as a Service

1. Expose the Deployment as a ClusterIP service.

```bash
kubectl expose deployment node-app --type=ClusterIP --port=80
```

2. Access the service within the cluster.

```bash
kubectl get svc
```
   
Use `kubectl port-forward` to test the service.
   
```bash
kubectl port-forward svc/node-app 8080:80
```

**Objective**: Learn how Services allow you to abstract and access your Pods.

---

### Exercise 4: Cleanup

1. Remove the service and deployment.

```bash
kubectl delete svc node-app
kubectl delete deployment node-app
```

**Objective**: Understand cleanup and resource management.