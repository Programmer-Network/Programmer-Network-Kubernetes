# Kubernetes Theory

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