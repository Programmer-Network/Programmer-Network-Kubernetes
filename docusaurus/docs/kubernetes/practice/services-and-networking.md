---
title: 'Exercise 6: Services and Networking'
---

## Objective

Learn about different Kubernetes Service types and networking patterns.
Understand when to use ClusterIP, NodePort, and LoadBalancer services.

## Prerequisites

- Completed [Exercise 5: Longhorn Storage](./longhorn-storage)
- Understanding of Deployments and Pods
- MetalLB installed (for LoadBalancer type) - check with
  `kubectl get pods -n metallb-system`

## Exercise: Expose Applications with Different Service Types

### Step 1: Create a Web Application

Let's create a simple web application to expose with different service types.

**YAML Version:** Create `app.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-06
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: practice-06
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

**Apply:**

```bash
kubectl apply -f app.yaml
```

**Wait for pods:**

```bash
kubectl wait --for=condition=ready pod -l app=web-app -n practice-06 --timeout=60s
```

### Step 2: ClusterIP Service (Default)

ClusterIP services are only accessible within the cluster. This is the default
service type.

**YAML Version:** Create `service-clusterip.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-clusterip
  namespace: practice-06
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

**Apply:**

```bash
kubectl apply -f service-clusterip.yaml
```

**Test (from within cluster):**

```bash
# Port forward to access from local machine
kubectl port-forward svc/web-app-clusterip 8080:80 -n practice-06

# In another terminal
curl http://localhost:8080
```

### Step 3: NodePort Service

NodePort services expose the application on a port on each node, making it
accessible from outside the cluster.

**YAML Version:** Create `service-nodeport.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-nodeport
  namespace: practice-06
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
      protocol: TCP
```

**Apply:**

```bash
kubectl apply -f service-nodeport.yaml
```

**Verify:**

```bash
kubectl get svc web-app-nodeport -n practice-06
```

Note the `30080` port. You can access the service at `<node-ip>:30080` from
outside the cluster.

### Step 4: LoadBalancer Service

LoadBalancer services get an external IP (via MetalLB in our setup) and are
accessible from outside the cluster.

**YAML Version:** Create `service-loadbalancer.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-loadbalancer
  namespace: practice-06
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
```

**Apply:**

```bash
kubectl apply -f service-loadbalancer.yaml
```

**Wait for external IP:**

```bash
kubectl get svc web-app-loadbalancer -n practice-06 -w
```

Once you see an `EXTERNAL-IP`, you can access the service at that IP from
outside the cluster.

### Step 5: Compare Service Types

Let's see the differences:

```bash
# List all services
kubectl get svc -n practice-06

# Check endpoints (should be the same for all)
kubectl get endpoints -n practice-06

# Describe each service to see details
kubectl describe svc web-app-clusterip -n practice-06
kubectl describe svc web-app-nodeport -n practice-06
kubectl describe svc web-app-loadbalancer -n practice-06
```

## Verification

Verify all service types are working:

```bash
# Check all services
kubectl get svc -n practice-06

# Verify endpoints (all should point to the same pods)
kubectl get endpoints -n practice-06

# Test ClusterIP (port forward)
kubectl port-forward svc/web-app-clusterip 8080:80 -n practice-06 &
curl http://localhost:8080

# Test NodePort (if you have node IP)
# curl http://<node-ip>:30080

# Test LoadBalancer (if external IP assigned)
# curl http://<external-ip>
```

## Understanding What Happened

- **ClusterIP**: Internal only, accessed via port-forward or from within cluster
- **NodePort**: Exposed on each node at a specific port (30000-32767 range)
- **LoadBalancer**: Gets external IP via MetalLB, accessible from outside
- **Service Selectors**: All services route to the same pods via label selectors
- **Endpoints**: Kubernetes automatically creates endpoints for services

## When to Use Each Type

- **ClusterIP**: Default for internal services, microservices communication
- **NodePort**: Quick external access for development/testing
- **LoadBalancer**: Production external access, integrates with ingress
  controllers

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-06
```

## Next Steps

→ [Exercise 7: CloudNative PG Basics](./cloudnative-pg-basics)

## Additional Practice

1. Create a service that selects pods by multiple labels
2. Check service endpoints:
   `kubectl get endpoints <service-name> -n practice-06`
3. Scale the deployment and watch endpoints update automatically
4. Try accessing the LoadBalancer service from outside the cluster
