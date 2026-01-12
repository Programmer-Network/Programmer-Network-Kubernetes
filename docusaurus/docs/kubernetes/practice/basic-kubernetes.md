---
title: 'Exercise 1: Basic Kubernetes Resources'
---

## Objective

Learn to create and manage basic Kubernetes resources: Pods, Deployments, and
Services. This is the foundation for everything else you'll do in Kubernetes.

## Prerequisites

- K3s cluster running
- `kubectl` configured and working
- Basic understanding of containers

Verify your setup:

```bash
kubectl get nodes
```

You should see your cluster nodes listed.

## Exercise: Deploy a Simple Web Application

### Step 1: Create a Namespace

Namespaces help organize your resources. Let's create one for this exercise.

**Command:**

```bash
kubectl create namespace practice-01
```

**YAML Version:** Create `namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-01
```

**Apply:**

```bash
kubectl apply -f namespace.yaml
```

**Verify:**

```bash
kubectl get namespace practice-01
```

### Step 2: Create a Deployment

A Deployment manages Pods and ensures they stay running. Let's deploy a simple
nginx web server.

**Command:**

```bash
kubectl create deployment hello-world \
  --image=nginx \
  --namespace=practice-01
```

**YAML Version:** Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
  namespace: practice-01
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

**Apply:**

```bash
kubectl apply -f deployment.yaml
```

**Verify:**

```bash
kubectl get deployment hello-world -n practice-01
kubectl get pods -n practice-01
```

Wait until the pod shows `Running` status.

### Step 3: Expose with a Service

Services provide a stable way to access your Pods. Let's create a ClusterIP
service.

**Command:**

```bash
kubectl expose deployment hello-world \
  --type=ClusterIP \
  --port=80 \
  --namespace=practice-01
```

**YAML Version:** Create `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world
  namespace: practice-01
spec:
  selector:
    app: hello-world
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

**Apply:**

```bash
kubectl apply -f service.yaml
```

**Verify:**

```bash
kubectl get service hello-world -n practice-01
```

### Step 4: Test the Application

Since ClusterIP services are only accessible within the cluster, we'll use port
forwarding to test it.

```bash
kubectl port-forward deployment/hello-world 8080:80 -n practice-01
```

In another terminal, test it:

```bash
curl http://localhost:8080
```

You should see the nginx welcome page HTML. Press `Ctrl+C` to stop port
forwarding.

## Verification

Check that everything is working:

```bash
# Check deployment
kubectl get deployment hello-world -n practice-01

# Check pods
kubectl get pods -n practice-01 -l app=hello-world

# Check service
kubectl get service hello-world -n practice-01

# Check service endpoints
kubectl get endpoints hello-world -n practice-01
```

All resources should show as ready and running.

## Understanding What Happened

- **Namespace**: Isolated environment for your resources
- **Deployment**: Manages Pod lifecycle, ensures desired number of replicas
- **Pod**: The actual container running nginx
- **Service**: Provides stable network access to Pods, even if they restart

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-01
```

Or delete individual resources:

```bash
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete -f namespace.yaml
```

## Next Steps

→ [Exercise 2: Namespaces and Resources](./namespaces-and-resources)

## Additional Practice

Try these variations:

1. Scale the deployment to 3 replicas:
   `kubectl scale deployment hello-world --replicas=3 -n practice-01`
2. Check how Kubernetes distributes the Pods:
   `kubectl get pods -n practice-01 -o wide`
3. Delete one Pod and watch it get recreated:
   `kubectl delete pod <pod-name> -n practice-01`
