# Kubernetes Command Cheatsheet

### Cluster Information and Health

1. **Check cluster components (control plane availability):**

```bash
kubectl get componentstatuses
```

2. **Get general cluster information:**

```bash
kubectl cluster-info
```

3. **List all nodes in the cluster (health/status):**

```bash
kubectl get nodes
```

4. **Get detailed information about a node:**

```bash
kubectl describe node <node-name>
```

5. **View the current Kubernetes version running:**

```bash
kubectl version --short
```

6. **Check any existing cluster issues or warning events globally:**

```bash
kubectl get events --all-namespaces --sort-by='.metadata.creationTimestamp'
```

### Workload / Pod Management

7. **View all pods across all namespaces:**

```bash
kubectl get pods --all-namespaces
```

8. **List the pods in a specific namespace (e.g., `default`,
   `longhorn-system`):**

```bash
kubectl get pods -n <namespace>
```

9. **Get detailed information for a specific pod:**

```bash
kubectl describe pod <pod-name> -n <namespace>
```

10. **Delete a pod (restarts the pod, useful for troubleshooting):**

```bash
kubectl delete pod <pod-name> -n <namespace>
```

11. **Create or apply resources from a YAML file:**

```bash
kubectl apply -f <filename>.yaml
```

12. **View YAML/JSON configuration dump of a resource:**

- **Output YAML:**

  ```bash
  kubectl get <resource> <name> -o yaml
  ```

- **Output JSON:**
  ```bash
  kubectl get <resource> <name> -o json
  ```

13. **Get logs from a pod:**

```bash
kubectl logs <pod-name> -n <namespace>
```

14. **Stream continuous logs from a pod:**

```bash
kubectl logs -f <pod-name> -n <namespace>
```

15. **Get logs for a specific container in a multi-container pod:**

```bash
kubectl logs <pod-name> -c <container-name> -n <namespace>
```

16. **Launch a debug pod for troubleshooting (basic busybox container in
    interactive terminal):**

```bash
kubectl run debug --image=busybox -it --rm -- /bin/sh
```

17. **Forcefully delete a pod (if stuck in terminating or other strange
    states):**

```bash
kubectl delete pod <pod-name> --grace-period=0 --force -n <namespace>
```

### Service & Endpoint Management

18. **List all services in a namespace:**

```bash
kubectl get svc -n <namespace>
```

19. **Get detailed information about a service:**

```bash
kubectl describe svc <service-name> -n <namespace>
```

20. **Forward a local port to a pod (e.g., for local access to service, like
    database):**

```bash
kubectl port-forward <pod-name> <local-port>:<remote-port> -n <namespace>
```

21. **Test if a service is functioning by listing endpoints:**

```bash
kubectl get endpoints <service-name> -n <namespace>
```

### Storage Management (Longhorn)

22. **List Longhorn volumes:**

```bash
kubectl get volumes -n longhorn-system
```

23. **Describe a Longhorn volume:**

```bash
kubectl describe <longhorn-volume-name> -n longhorn-system
```

24. **List PersistentVolumeClaims (PVCs) in a namespace:**

```bash
kubectl get pvc -n <namespace>
```

25. **Delete a PersistentVolumeClaim (PVC) carefully:**

```bash
kubectl delete pvc <pvc-name> -n <namespace>
```

26. **Check the status of Longhorn-csi or other stateful sets:**

```bash
kubectl get statefulsets -n longhorn-system
```

27. **List all StorageClasses (to verify Longhorn's StorageClasses):**

```bash
kubectl get storageclass
```

### Namespace Management

28. **List all namespaces:**

```bash
kubectl get namespaces
```

29. **Switch context to a different namespace:**

```bash
kubectl config set-context --current --namespace=<namespace>
```

30. **Create a new namespace:**

```bash
kubectl create namespace <namespace-name>
```

31. **Delete a namespace (use caution):**

```bash
kubectl delete namespace <namespace-name>
```

### PostgreSQL Management (example provider)

32. **List PostgreSQL-related resources (assuming you have CRDs or a PostgreSQL
    operator installed):**

```bash
kubectl get postgresql -n <namespace>
```

33. **Describe a PostgreSQL instance:**

```bash
kubectl describe postgresql <pg-instance-name> -n <namespace>
```

34. **Connect to the PostgreSQL pod for database debugging:**

```bash
kubectl exec -it <pg-pod-name> -n <namespace> -- psql -U postgres
```

### Resource & Utilization Monitoring

35. **View resource usage (CPU/Memory) for nodes and pods (requires
    metrics-server):**

- **For nodes:**

  ```bash
  kubectl top nodes
  ```

- **For pods (in a specific namespace):**
  ```bash
  kubectl top pods -n <namespace>
  ```

36. **Check events for troubleshooting issues in a namespace:**

```bash
kubectl get events -n <namespace>
```

37. **Get details about a Deployment:**

```bash
kubectl describe deployment <deployment-name> -n <namespace>
```

### Scale Deployments

38. **Scale up/down the number of replicas in a Deployment:**

```bash
kubectl scale deployment <deployment-name> --replicas=<number-of-replicas> -n <namespace>
```

39. **Autoscale a Deployment based on CPU usage:**

```bash
kubectl autoscale deployment <deployment-name> --cpu-percent=<percent> --min=<min-replicas> --max=<max-replicas> -n <namespace>
```

### Debugging & Troubleshooting

40. **Check recent events sorted by timestamp to diagnose issues:**

```bash
kubectl get events --sort-by='.metadata.creationTimestamp' -n <namespace>
```

41. **Open a shell session inside a running container:**

```bash
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash
```

42. **Run one-off commands in a container (e.g., to run a curl command):**

```bash
kubectl exec -it <pod-name> -n <namespace> -- curl <url>
```

43. **Get the history of resource changes for a deployment (e.g., when scaling
    happens):**

```bash
kubectl rollout history deployment <deployment-name> -n <namespace>
```

### Service Account Management (API & Permissions)

44. **List all service accounts in a namespace:**

```bash
kubectl get serviceaccounts -n <namespace>
```

45. **Get details about a specific service account:**

```bash
kubectl describe serviceaccount <service-account-name> -n <namespace>
```

46. **Create a service account:**

```bash
kubectl create serviceaccount <service-account-name> -n <namespace>
```

47. **Delete a service account:**

```bash
kubectl delete serviceaccount <service-account-name> -n <namespace>
```

### Configuration Management

48. **View all ConfigMaps in a namespace:**

```bash
kubectl get configmap -n <namespace>
```

49. **Describe a specific ConfigMap:**

```bash
kubectl describe configmap <configmap-name> -n <namespace>
```

50. **List Secrets (API keys, credentials, etc.) in a namespace:**

```bash
kubectl get secrets -n <namespace>
```

51. **Decode a base64-encoded Secret to reveal its true content:**

```bash
kubectl get secret <secret-name> -n <namespace> -o jsonpath="{.data.<secret-key>}" | base64 --decode
```

---

### Additional Tips:

- **Backup critical configurations:** Before making any destructive operations
  like `delete`, always back up your resource configurations or use GitOps
  processes.
- **Use dry-run mode for testing deletions**: Use `--dry-run=client` to simulate
  applying or deleting things without actually making changes.

Tools like **`kubectl krew`** can extend the functionality of `kubectl` and
provide additional `kubectl` plugins for advanced features.
