---
title: Getting Started
---


At this point, our Raspberry Pis should be configured, and we should have a basic understanding of Kubernetes. Most importantly, we know why we're learning all of this. Now, let's move into the practical side of things by using [`kubectl`](https://kubernetes.io/docs/reference/kubectl/) (pronounced "kube-control"). 

Until we start using tools like [`helm`](https://helm.sh/), [`kubectl`](https://kubernetes.io/docs/reference/kubectl/) will be our best friend. As I've mentioned before in previous sections or during my [live streams](https://www.twitch.tv/programmer_network), we should add tools and abstractions only **once** the work becomes repetitive and frustrating. 

In this case, we aren't going to use [`helm`](https://helm.sh/) until we've learned how to use [`kubectl`](https://kubernetes.io/docs/reference/kubectl/) thoroughly and memorized the key commands. Mastering the basics will help us build a strong foundation and make it clear when it's time to introduce new abstractions.

## Namespace Setup

**Create a new Kubernetes Namespace**:

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

**Deploy a Simple App**: 

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

**Expose the Deployment**: 

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

**Verify Using Port-Forward**: 

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

## Exercises

### Exercise 1: Create and Examine a Pod

Create a simple Pod running Nginx.

```bash
kubectl run nginx-pod --image=nginx --restart=Never
```
    
Examine the Pod.

```bash
kubectl describe pod nginx-pod
```
    
Delete the Pod.

```bash
kubectl delete pod nginx-pod
```

**Objective**: Familiarize yourself with the Pod lifecycle.

### Exercise 2: Create a Deployment

Create a Deployment for a simple Node.js app (You can use a Docker image like `node:20`).

```bash
kubectl create deployment node-app --image=node:20
```

Scale the Deployment.

```bash
kubectl scale deployment node-app --replicas=3
```

Rollback the Deployment.

```bash
kubectl rollout undo deployment node-app
```

**Objective**: Learn how to manage application instances declaratively using Deployments.

### Exercise 3: Expose the Deployment as a Service

Expose the Deployment as a ClusterIP service.

```bash
kubectl expose deployment node-app --type=ClusterIP --port=80
```

Access the service within the cluster.

```bash
kubectl get svc
```
   
Use `kubectl port-forward` to test the service.
   
```bash
kubectl port-forward svc/node-app 8080:80
```

**Objective**: Learn how Services allow you to abstract and access your Pods.

### Exercise 4: Cleanup

Remove the service and deployment.

```bash
kubectl delete svc node-app
kubectl delete deployment node-app
```

**Objective**: Understand cleanup and resource management.