---
title: Troubleshooting Common Issues
---

## Overview

When things go wrong in your K3s cluster, having a systematic troubleshooting
approach helps you resolve issues quickly. This guide covers common problems and
their solutions.

## General Troubleshooting Approach

1. **Gather Information**: Collect logs, events, and status information
2. **Identify the Scope**: Determine if it's a node, pod, service, or
   cluster-wide issue
3. **Check Recent Changes**: Review what changed recently (updates, deployments,
   config changes)
4. **Isolate the Problem**: Narrow down to specific components
5. **Apply Fixes**: Start with least invasive solutions
6. **Verify Resolution**: Confirm the issue is resolved and monitor

## Node Issues

### Node Not Ready

**Symptoms:**

- Node shows `NotReady` status in `kubectl get nodes`
- Pods cannot be scheduled on the node

**Diagnosis:**

```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check node conditions
kubectl get node <node-name> -o yaml | grep -A 10 conditions
```

**Common Causes and Solutions:**

1. **K3s Service Not Running:**

   ```bash
   # On the affected node
   sudo systemctl status k3s
   sudo systemctl start k3s
   sudo journalctl -u k3s -n 100
   ```

2. **Network Connectivity Issues:**

   ```bash
   # Test connectivity from other nodes
   ping <node-ip>
   # Check DNS resolution
   nslookup <node-name>
   ```

3. **Disk Space Issues:**

   ```bash
   # On the affected node
   df -h
   # Check K3s data directory
   du -sh /var/lib/rancher/k3s/*
   ```

4. **Certificate Issues:**
   ```bash
   # Check certificate expiration
   sudo k3s certificate rotate-ca
   ```

### Node Resource Exhaustion

**Symptoms:**

- Pods stuck in `Pending` state
- Node shows `MemoryPressure` or `DiskPressure`

**Diagnosis:**

```bash
# Check node resources
kubectl describe node <node-name>
kubectl top node <node-name>

# Check resource usage by pod
kubectl top pods -A --sort-by=memory
```

**Solutions:**

1. **Free Up Resources:**

   ```bash
   # Identify resource-heavy pods
   kubectl top pods -A
   # Delete unnecessary pods or scale down deployments
   ```

2. **Add Resource Limits:**

   ```yaml
   # In your pod/deployment spec
   resources:
     requests:
       memory: '64Mi'
       cpu: '250m'
     limits:
       memory: '128Mi'
       cpu: '500m'
   ```

3. **Add More Nodes:**
   - Scale your cluster by adding worker nodes

## Pod Issues

### Pod Stuck in Pending

**Symptoms:**

- Pod shows `Pending` status
- Pod never starts

**Diagnosis:**

```bash
# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Check for resource constraints
kubectl get nodes
kubectl top nodes
```

**Common Causes:**

1. **Insufficient Resources:**
   - No nodes have available CPU/memory
   - Solution: Free up resources or add nodes

2. **Node Selector/Affinity Issues:**

   ```bash
   # Check pod spec for node selectors
   kubectl get pod <pod-name> -n <namespace> -o yaml | grep -A 5 nodeSelector
   # Verify nodes match selector
   kubectl get nodes --show-labels
   ```

3. **PVC Not Bound:**
   ```bash
   # Check PVC status
   kubectl get pvc -n <namespace>
   # Check storage class
   kubectl get storageclass
   ```

### Pod CrashLoopBackOff

**Symptoms:**

- Pod repeatedly crashes and restarts
- Pod shows `CrashLoopBackOff` status

**Diagnosis:**

```bash
# Check pod logs
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous

# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Check container exit codes
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[*].lastState.terminated.exitCode}'
```

**Common Causes:**

1. **Application Errors:**
   - Check application logs for errors
   - Verify configuration files
   - Check environment variables

2. **Resource Limits:**

   ```bash
   # Check if OOM killed
   kubectl describe pod <pod-name> -n <namespace> | grep -i oom
   # Increase memory limits if needed
   ```

3. **Missing Dependencies:**
   - Verify required services are available
   - Check service endpoints: `kubectl get endpoints -n <namespace>`

4. **Configuration Issues:**
   - Verify ConfigMaps and Secrets are correct
   - Check volume mounts

### Pod Image Pull Errors

**Symptoms:**

- Pod shows `ImagePullBackOff` or `ErrImagePull`
- Container cannot start

**Diagnosis:**

```bash
# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Verify image exists and is accessible
docker pull <image-name>
```

**Solutions:**

1. **Private Registry Authentication:**

   ```bash
   # Create image pull secret
   kubectl create secret docker-registry <secret-name> \
     --docker-server=<registry-url> \
     --docker-username=<username> \
     --docker-password=<password> \
     -n <namespace>

   # Add to pod spec
   imagePullSecrets:
     - name: <secret-name>
   ```

2. **Network Issues:**
   - Check cluster can reach registry
   - Verify DNS resolution for registry

## Network Issues

### Service Not Accessible

**Symptoms:**

- Cannot access service from within or outside cluster
- Service endpoints are empty

**Diagnosis:**

```bash
# Check service
kubectl get svc -n <namespace>
kubectl describe svc <service-name> -n <namespace>

# Check endpoints
kubectl get endpoints <service-name> -n <namespace>

# Check pods
kubectl get pods -n <namespace> -l <selector>
```

**Solutions:**

1. **No Endpoints:**
   - Verify pod labels match service selector
   - Check pods are running and ready

2. **Port Mismatch:**
   - Verify service port matches pod container port
   - Check targetPort in service spec

3. **Network Policies:**
   ```bash
   # Check for network policies blocking traffic
   kubectl get networkpolicies -A
   ```

### DNS Resolution Issues

**Symptoms:**

- Cannot resolve service names
- DNS queries fail

**Diagnosis:**

```bash
# Check CoreDNS pods
kubectl get pods -n kube-system | grep coredns

# Test DNS from pod
kubectl run -it --rm --restart=Never test-dns --image=busybox -- nslookup kubernetes.default

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns
```

**Solutions:**

1. **CoreDNS Not Running:**

   ```bash
   # Restart CoreDNS
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   ```

2. **DNS Configuration:**
   - Check CoreDNS ConfigMap:
     `kubectl get configmap coredns -n kube-system -o yaml`
   - Verify upstream DNS servers

## Storage Issues

### PVC Not Binding

**Symptoms:**

- PVC shows `Pending` status
- Pods cannot start due to missing volumes

**Diagnosis:**

```bash
# Check PVC status
kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>

# Check storage class
kubectl get storageclass
kubectl describe storageclass <storage-class-name>
```

**Solutions:**

1. **Storage Class Issues:**
   - Verify storage class exists and is default
   - Check provisioner is running (e.g., Longhorn)

2. **Insufficient Storage:**
   - Check available storage in storage system
   - For Longhorn: `kubectl get volumes -n longhorn-system`

3. **Access Mode Mismatch:**
   - Verify PVC access mode matches storage class capabilities

### Volume Mount Errors

**Symptoms:**

- Pod cannot mount volume
- Permission denied errors

**Diagnosis:**

```bash
# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Verify volume exists
kubectl get pv
kubectl get pvc -n <namespace>
```

**Solutions:**

1. **Volume Not Found:**
   - Verify PVC exists and is bound
   - Check volume name in pod spec

2. **Permission Issues:**
   - Check security context in pod spec
   - Verify volume supports required access mode

## Certificate Issues

### Certificate Expiration

**Symptoms:**

- Authentication failures
- TLS handshake errors

**Diagnosis:**

```bash
# Check certificate expiration (on node)
sudo k3s certificate rotate-ca --check

# Check API server certificate
openssl x509 -in /var/lib/rancher/k3s/server/tls/server.crt -noout -dates
```

**Solutions:**

1. **Rotate Certificates:**

   ```bash
   # On each node
   sudo k3s certificate rotate-ca
   ```

2. **Manual Certificate Renewal:**
   - Follow K3s certificate renewal documentation
   - May require cluster restart in some cases

## etcd Issues (HA Clusters)

### etcd Pod Not Running

**Symptoms:**

- etcd pod in `Error` or `CrashLoopBackOff`
- Cluster connectivity issues

**Diagnosis:**

```bash
# Check etcd pods
kubectl get pods -n kube-system | grep etcd

# Check etcd logs
kubectl logs -n kube-system etcd-<node-name>
```

**Solutions:**

1. **etcd Data Corruption:**
   - Restore from etcd snapshot
   - See [Backup and Disaster Recovery](./k3s-backup-disaster-recovery)

2. **Quorum Loss:**
   - Ensure majority of etcd nodes are running
   - In 3-node cluster, need at least 2 nodes

## Log Analysis

### Viewing Logs

```bash
# Pod logs
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
kubectl logs <pod-name> -n <namespace> --tail=100 -f

# Component logs
kubectl logs -n kube-system <component-pod>

# K3s service logs (on node)
sudo journalctl -u k3s -n 100
sudo journalctl -u k3s -f
```

### Common Log Patterns

- **OOM Killed**: `Out of memory` or `OOMKilled`
- **Image Pull**: `Failed to pull image` or `ImagePullBackOff`
- **Crash**: `container exited with code` or `CrashLoopBackOff`
- **Network**: `connection refused` or `timeout`

## Getting Help

If you cannot resolve an issue:

1. **Collect Information:**

   ```bash
   # Cluster info
   kubectl cluster-info dump > cluster-info.txt

   # Node info
   kubectl get nodes -o yaml > nodes.yaml

   # Recent events
   kubectl get events -A > events.txt
   ```

2. **Check Documentation:**
   - [K3s Documentation](https://docs.k3s.io/)
   - [Kubernetes Troubleshooting](https://kubernetes.io/docs/tasks/debug/)

3. **Community Resources:**
   - K3s GitHub Issues
   - Kubernetes Slack/Discord

## Related Documentation

- [K3s Maintenance Overview](./k3s-maintenance) - Maintenance overview
- [Health Checks](./k3s-maintenance-health) - Proactive health monitoring
- [Updating K3s](./k3s-maintenance-updates) - Update-related issues
- [Backup and Disaster Recovery](./k3s-backup-disaster-recovery) - Recovery
  procedures
