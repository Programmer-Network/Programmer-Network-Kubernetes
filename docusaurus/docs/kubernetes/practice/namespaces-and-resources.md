---
title: 'Exercise 2: Namespaces and Resources'
---

## Objective

Learn how to organize and manage resources using namespaces, and understand
resource management concepts like resource quotas and labels.

## Prerequisites

- Completed [Exercise 1: Basic Kubernetes](./basic-kubernetes)
- Understanding of Pods, Deployments, and Services

## Exercise: Organize Resources with Namespaces

### Step 1: Create Multiple Namespaces

Namespaces help you organize resources and apply policies. Let's create separate
namespaces for different environments.

**YAML Version:** Create `namespaces.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
---
apiVersion: v1
kind: Namespace
metadata:
  name: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: production
```

**Apply:**

```bash
kubectl apply -f namespaces.yaml
```

**Verify:**

```bash
kubectl get namespaces
```

### Step 2: Deploy Applications to Different Namespaces

Let's deploy the same application to different namespaces to see how namespaces
provide isolation.

**YAML Version:** Create `deployment-dev.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: development
  labels:
    app: web-app
    environment: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        environment: development
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

**YAML Version:** Create `deployment-staging.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: staging
  labels:
    app: web-app
    environment: staging
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        environment: staging
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

**Apply:**

```bash
kubectl apply -f deployment-dev.yaml
kubectl apply -f deployment-staging.yaml
```

### Step 3: Use Labels and Selectors

Labels help you organize and select resources. Let's see how they work.

**List pods by label:**

```bash
# All web-app pods
kubectl get pods -l app=web-app --all-namespaces

# Only development pods
kubectl get pods -l environment=development --all-namespaces

# Combined selector
kubectl get pods -l app=web-app,environment=development -n development
```

### Step 4: Resource Queries Across Namespaces

See how namespaces isolate resources:

```bash
# Pods in specific namespace
kubectl get pods -n development
kubectl get pods -n staging

# All pods across all namespaces
kubectl get pods --all-namespaces

# Deployments in all namespaces
kubectl get deployments --all-namespaces
```

## Verification

Verify namespace isolation:

```bash
# Check deployments in each namespace
kubectl get deployments -n development
kubectl get deployments -n staging

# Verify pods are isolated
kubectl get pods -n development
kubectl get pods -n staging

# Check that services in one namespace can't see pods in another
kubectl get endpoints -n development
kubectl get endpoints -n staging
```

## Understanding What Happened

- **Namespaces**: Provide logical separation and isolation
- **Labels**: Key-value pairs for organizing and selecting resources
- **Selectors**: Used to match resources by labels
- **Isolation**: Resources in different namespaces are isolated from each other

## Cleanup

Remove all resources:

```bash
kubectl delete namespace development
kubectl delete namespace staging
kubectl delete namespace production
```

## Next Steps

→ [Exercise 3: ConfigMaps and Secrets](./configmaps-and-secrets)

## Additional Practice

1. Create a namespace with a specific label:
   `kubectl create namespace test --dry-run=client -o yaml | kubectl label --local -f - team=backend -o yaml`
2. List all namespaces with a label: `kubectl get namespaces -l team=backend`
3. Try to access a pod from another namespace (it won't work without proper
   service configuration)
