---
title: Command Cheatsheet
---

### Cluster Information and Health

Check cluster components (control plane availability):

```bash
kubectl get componentstatuses
```

Get general cluster information:

```bash
kubectl cluster-info
```

List all nodes in the cluster:

```bash
kubectl get nodes
```

Get detailed information about a node:

```bash
kubectl describe node <node-name>
```


### Workload Management
View all pods across all namespaces:

```bash
kubectl get pods --all-namespaces
```

List the pods in a specific namespace (e.g., `default`, `longhorn-system`):

```bash
kubectl get pods -n <namespace>
```

Get detailed information for a specific pod:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

Delete a pod (useful for forcing a restart):

```bash
kubectl delete pod <pod-name> -n <namespace>
```

Create or apply resources from a YAML file (deploy manifests, services, etc.):

```bash
kubectl apply -f <filename>.yaml
```

Get logs from a pod (basic logs for debugging):

```bash
kubectl logs <pod-name> -n <namespace>
```

Stream continuous logs from a pod (for dynamic updates):

```bash
kubectl logs -f <pod-name> -n <namespace>
```

Get logs for a specific container in a multi-container pod:

```bash
kubectl logs <pod-name> -c <container-name> -n <namespace>
```


Service & Endpoint Management
13. List all services in a namespace:

```bash
kubectl get svc -n <namespace>
```

Get detailed information about a service:

```bash
kubectl describe svc <service-name> -n <namespace>
```

Forward a local port to a port within a pod (e.g., for accessing a specific pod's service locally like a database):

```bash
kubectl port-forward <pod-name> <local-port>:<remote-port> -n <namespace>
```


Storage Management (Longhorn)
16. List Longhorn volumes:

```bash
kubectl get volumes -n longhorn-system
```

Describe a Longhorn volume:

```bash
kubectl describe <longhorn-volume-name> -n longhorn-system
```

Check the status of Longhorn-csi or any stateful sets:

```bash
kubectl get statefulsets -n longhorn-system
```


### Namespace Management
List all namespaces:

```bash
kubectl get namespaces
```

Switch context to a different namespace:  
Change the default namespace to avoid having to specify `-n <namespace>` each time:

```bash
kubectl config set-context --current --namespace=<namespace>
```


### PostgreSQL Management (example provider)
List PostgreSQL-related resources (assuming you have some CRDs or kubedb/k8s-postgres-operator):

```bash
kubectl get postgresql -n <namespace>
```

Describe a PostgreSQL instance, if any:

```bash
kubectl describe postgresql <pg-instance-name> -n <namespace>
```

Connect to the PostgreSQL pod for database debugging:

```bash
kubectl exec -it <pg-pod-name> -n <namespace> -- psql -U postgres
```


### Resource & Utilization Monitoring
View resource usage (CPU/Memory) for nodes and pods (if metrics-server is installed):

```bash
kubectl top nodes
kubectl top pods -n <namespace>
```

Check events for troubleshooting issues within a namespace:

```bash
kubectl get events -n <namespace>
```

Get details about a Deployment:

```bash
kubectl describe deployment <deployment-name> -n <namespace>
```


### Scale Deployments
Scale up/down the number of replicas in a Deployment:

```bash
kubectl scale deployment <deployment-name> --replicas=<number-of-replicas> -n <namespace>
```


### Debugging & Troubleshooting
Check recent events to diagnose issues:

```bash
kubectl get events --sort-by='.metadata.creationTimestamp' -n <namespace>
```

Open a shell session inside a running container:

```bash
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash
```

Run one-off commands in a container (e.g., to run a curl command):

```bash
kubectl exec -it <pod-name> -n <namespace> -- curl <url>
```


### Service Account Management (if interacting with APIs or permissions)
List all service accounts:

```bash
kubectl get serviceaccounts -n <namespace>
```

Get details about a specific service account:

```bash
kubectl describe serviceaccount <service-account-name> -n <namespace>
```


### Configuration Management
View all ConfigMaps (commonly used for storing configuration data):

```bash
kubectl get configmap -n <namespace>
```

Describe a specific ConfigMap for details:

```bash
kubectl describe configmap <configmap-name> -n <namespace>
```

List Secrets (API keys, credentials, etc.):

```bash
kubectl get secrets -n <namespace>
```

Decode a base64-encoded Secret to reveal its content:

```bash
kubectl get secret <secret-name> -n <namespace> -o jsonpath="{.data.<secret-key>}" | base64 --decode
```



- Always be careful when using commands like `delete`, especially if you're managing persistent services like Longhorn, PostgreSQL databases, etc., since it could lead to unintended data loss.
- You may also install tools like `kubectl krew` to extend the functionality of `kubectl`.

