---
title: Kubernetes Networking
---

#### What is Network Load Balancing?

Network load balancing is a critical process that distributes incoming network
traffic across multiple backend servers or pods. This distribution ensures that
no single server becomes overloaded, enhancing application response times,
availability, and fault tolerance. It's like directing vehicles on a highway to
different lanes to avoid congestion.

#### Load Balancer

A load balancer operates as a
[gateway](<https://en.wikipedia.org/wiki/Gateway_(telecommunications)>) that
receives incoming requests and decides how to distribute them across the
available servers. This ensures
[high availability](https://en.wikipedia.org/wiki/High_availability) and
[reliability](https://en.wikipedia.org/wiki/Reliability_engineering) by
balancing the load and increasing
[failover](https://en.wikipedia.org/wiki/Failover) capabilities.

#### MetalLB in Kubernetes

- **Purpose**: Designed for environments like Raspberry Pi clusters, MetalLB
  provides network load balancing for bare-metal Kubernetes settings that lack a
  built-in cloud LoadBalancer service.
- **Functionality**: MetalLB assigns external IP addresses to services, enabling
  your Kubernetes cluster to be externally accessible and allowing traffic to
  reach your cluster services efficiently.

#### Ingress Controllers (Traefik, NGINX)

- **Purpose**: Ingress controllers manage HTTP and HTTPS traffic, facilitating
  external access to internal Kubernetes services.
- **Functionality**: They route incoming requests based on specified rules such
  as domain names or URL paths. For instance:
  - Requests to `api.example.com` might be routed to a backend API service.
  - Requests to `www.example.com` could be directed to a frontend service.

#### Port Forwarding

- **Purpose**: Port forwarding acts as a direct pathway from your local machine
  to a pod within the cluster, bypassing more complex routing like ingress.
- **Use Case**: It's particularly useful for development and debugging, allowing
  developers to connect directly to specific pods.

### Integrating [MetalLB](https://metallb.universe.tf/) and Ingress Controllers

[MetalLB](https://metallb.universe.tf/) is not mutually exclusive with ingress
controllers. Instead, they can work together.
[MetalLB](https://metallb.universe.tf/) can provide an external IP address for
your services, allowing your ingress controller (like Traefik or NGINX) to route
incoming traffic to various services in your cluster.

1. **[MetalLB](https://metallb.universe.tf/)**:
   - Provides external IPs to the LoadBalancer services, thereby making them
     accessible from outside the cluster.

2. **Ingress Controller**:
   - Utilizes the IPs provided by [MetalLB](https://metallb.universe.tf/) to
     manage routing of incoming HTTP/HTTPS requests. It's configured through
     ingress resources, which dictate traffic handling:
     - **Domain-Based Routing**: Traffic can be directed to services based on
       the domain accessed.
     - **Path-Based Routing**: Specific URL paths can point to distinct
       services.

### Kubernetes ClusterIP vs NodePort vs LoadBalancer vs Ingress?

Let's explore Kubernetes service types, ClusterIP, NodePort, LoadBalancer, and
Ingress, and explain when to use each one and how they can work together.

#### ClusterIP

**What It Is:**

- ClusterIP is the default Kubernetes service type that exposes a service on a
  cluster-internal IP. This service type is only accessible within the cluster.

**Use Cases:**

- **Internal Communication**: Ideal for services that only need to communicate
  with other services within the cluster (e.g., microservices architecture).
- **Backend Services**: Suitable for databases or back-end services that should
  not be accessed directly from the outside.

**Pros:**

- Provides a simple way to manage internal services without exposing them to the
  outside.
- Reduces security risks by limiting external access.

**Cons:**

- Not suitable for direct access from outside the cluster.

#### NodePort

**What It Is:**

- NodePort exposes a service on each node's IP at a specific port. It creates a
  static port on each node and forwards traffic to your service.

**Use Cases:**

- **Local Development**: Ideal for development environments or testing purposes
  where simple access is needed.
- **Small-Scale Applications**: When running a small or non-critical setup where
  direct node access is required.
- **Debugging**: Suitable for scenarios where quick access to a service from an
  external source is necessary for troubleshooting.

**Pros:**

- Simple to set up and does not require external infrastructure like a load
  balancer.

**Cons:**

- Requires manual management of ports, which can become complex in larger
  environments.
- Not ideal for high availability since traffic can overwhelm a single node.

#### LoadBalancer

**What It Is:**

- LoadBalancer creates an external load balancer in supported environments,
  assigning an external IP address to your service. MetalLB can simulate this in
  bare metal environments like those with Raspberry Pis.

**Use Cases:**

- **Production-Ready Applications**: When you need stable IP addresses and
  external access in production environments.
- **Auto-Scaling Needs**: In scenarios where you need automatic distribution of
  traffic across pods without manual management.

**Pros:**

- Provides a single, stable point of access.
- Managed traffic distribution across multiple nodes.

**Cons:**

- Can be costly in some cloud environments due to resource usage.
- Simpler than Ingress, hence does not support HTTP-level routing or SSL
  termination.

#### Ingress

**What It Is:**

- Ingress manages external access to services within a cluster, typically
  HTTP/HTTPS. Ingress controllers handle routing rules and can offer additional
  functionality like SSL termination and host/path-based routing.

**Use Cases:**

- **Complex Applications**: Suitable for environments with multiple services
  that require sophisticated routing based on domains or paths.
- **Unified Entry Point**: When you want to consolidate access through a single,
  manageable endpoint.
- **Secure Connections**: Supports SSL termination, critical for secure
  communication over the web.

**Pros:**

- Offers rich routing features and flexibility.
- Can manage multiple services through a single gateway.

**Cons:**

- Requires additional configuration and management.
- Initial setup can be complex and requires understanding of ingress rules and
  controllers.

### Recommendations

- **Choose ClusterIP for**: Services only needing internal communication within
  the cluster.
- **Choose NodePort for**: Simplicity in small, non-production setups where each
  node's IP can handle incoming requests.
- **Choose LoadBalancer for**: Production needs in cloud environments or using
  MetalLB for external IP management in bare-metal scenarios.
- **Choose Ingress for**: Complex routing logic, SSL support, and environments
  requiring a unified interface for multiple services.
