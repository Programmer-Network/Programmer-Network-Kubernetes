---
title: Kubernetes Networking Explained
---

## Objectives:

1. How **networking works in Kubernetes** (flat networking and DNS).
2. Types of Kubernetes **Service** resources and their usage.
3. How **Ingress** works and integrates with your cluster.
4. **Cross-namespace pod/service communication**.
5. How to **restrict communication** with Network Policies.
6. Bonus tips for optimizing and securing your cluster's networking.

## The Basics of Kubernetes Networking

Kubernetes networking is designed to be **simple and flat**:

- Any pod can communicate with any other pod in the cluster, regardless of which
  namespace they're in. This communication works out of the box without
  additional configuration.
- Pods and services use **DNS** for service discovery instead of hardcoding IP
  addresses.

### Pod-to-Pod Networking

Every pod is assigned a unique IP address. All pods share a single, flat address
space, so there’s no
[Network Address Translation (NAT)](https://www.youtube.com/watch?v=FTUV0t6JaDA)
when pods communicate. However, pod IPs are
[ephemeral](https://www.google.com/search?q=ephemeral&oq=ephemeral&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBBzExOWowajeoAgCwAgA&sourceid=chrome&ie=UTF-8),
they change if a pod is restarted.

### Pod-to-Service Networking with DNS

Kubernetes provides a built-in DNS service that allows pods to resolve services
using their names. For example:

- A service called `nodejs-service` in the `default` namespace can be resolved
  by other pods in the same namespace as:

```
http://nodejs-service
```

- From another namespace, it might look like:

```
http://nodejs-service.default.svc.cluster.local
```

This DNS-based service discovery simplifies communication between pods and
services, especially in complex setups.

## Key Networking Components in Kubernetes

### **A. Services**

Services are used to expose a group of pods (selected using labels) over the
network and provide a stable address for accessing them.

Three key types of services:

1. **ClusterIP** (default)

- Accessible **within the cluster only**.
- Provides internal networking between pods.
- Example: A backend service used by a frontend within the same application
  stack.

2. **NodePort**

- Exposes a service on a static port across all cluster nodes.
- Mostly used for development purposes but not ideal for production due to
  limited network flexibility.

3. **LoadBalancer**

- Requests an external IP to expose the service outside your cluster. In K3s,
  this integrates with **MetalLB** to assign an IP from your private pool.

> Tip: Minimize `LoadBalancer` usage by routing external traffic via an
> **Ingress Controller** for better efficiency.

## Ingress: The Gateway to Your Cluster

Ingress is responsible for **routing external HTTP / HTTPS traffic** to services
within your cluster. It integrates seamlessly with **Traefik**, your Ingress
Controller in K3s.

### How It Works:

1. Create your services (e.g., `ClusterIP` services for Node.js, backends,
   etc.).
2. Define an Ingress resource:
   - Map hostnames (e.g., `nodejs.example.com`) or path prefixes (e.g., `/api`)
     to specific services.
3. Traefik manages incoming requests and routes them to the appropriate service.

**Example Ingress Resource:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - host: nodejs.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nodejs-service
                port:
                  number: 80
```

### Benefits of Ingress:

- Reduces the need for multiple `LoadBalancer` services, only Traefik’s load
  balancer requires an external IP.
- Simplifies DNS-based routing for multiple services.

## Cross-Namespace Networking

### **Default Behavior:**

In K3s/Kubernetes, pods and services in one namespace can communicate with those
in another **by default**. You can achieve this by:

1. Using DNS:
   - `<service-name>.<namespace>.svc.cluster.local`
   - Example: `http://postgres-service.database.svc.cluster.local`

2. Accessing services by IP/methods if service discovery is properly managed.

### **Restricting Cross-Namespace Communication**

To prevent unrestricted communication between namespaces, use **Network
Policies** (see below).

## Network Policies: Restricting Internal Communication

By default, Kubernetes allows all traffic between pods and across namespaces. To
secure your cluster, you can leverage **Network Policies** to restrict ingress
(incoming) and/or egress (outgoing) traffic.

### **How Network Policies Work**

Network Policies let you:

1. Define which pods are allowed to receive traffic (ingress).
2. Define which pods are allowed to send traffic (egress).
3. Use labels and selectors to control access between pods/services.

### Examples:

#### **Default-Deny All Traffic**

The foundation of securing your cluster:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

- Blocks all traffic to/from pods in the `default` namespace unless explicitly
  allowed.

#### **Allow Specific Namespace Traffic**

Allow only traffic originating from pods in a specific namespace (e.g.,
`frontend` namespace):

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-namespace-frontend
  namespace: backend
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              role: frontend
```

- In the `backend` namespace, only pods from the `frontend` namespace (labeled
  `role: frontend`) can communicate.

#### **Allow Specific Pod Communication**

Allow only a specific pod to communicate with another (e.g., frontend →
backend):

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-backend
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
```

- Backend pods (`app: backend`) can only receive traffic from frontend pods
  (`app: frontend`).

## Useful Tools for Debugging Networking in K3s

1. **DNS Resolution**

- Verify service discovery with DNS:

```bash
kubectl exec -it <pod-name> -- nslookup <service-name>
```

2. **Curl/HTTP Testing**

- Use `curl` or similar tools to confirm connectivity between services:

```bash
kubectl exec -it <pod-name> -- curl <service-name>
```

3. **Logs for Ingress**

- Check Traefik logs to diagnose routing issues.

4. **Network Policy Debugging**

- Use tools like **Cilium** (if installed) or **NetworkPolicy Viewer** addons
  for better visualization of applied policies.

## Best Practices for K3s Networking

- Use **ClusterIP** for internal services and restrict `NodePort` services.
- Depend on **Ingress** for external HTTP/S access, reduce the use of multiple
  `LoadBalancer` services.
- Enforce a **default-deny policy** and gradually allow necessary traffic.
- Use namespace labels and Network Policies to isolate and secure workloads.
- Monitor and audit your networking policies and Traefik configurations
  regularly.
