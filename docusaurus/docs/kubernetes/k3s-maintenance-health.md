---
title: Health Checks and Monitoring
---

## Overview

Regular health checks help you identify issues before they become critical. This
guide covers how to monitor your K3s cluster's components, nodes, and workloads
to ensure everything is running smoothly.

## Cluster-Level Health Checks

### Check All Nodes Status

The most basic health check is verifying all nodes are in a `Ready` state:

```bash
kubectl get nodes
```

**Expected Output:**

```bash
NAME                  STATUS   ROLES                  AGE   VERSION
k3s-server-1.cluster  Ready    control-plane,master   30d   v1.28.5+k3s1
k3s-server-2.cluster  Ready    control-plane,master   30d   v1.28.5+k3s1
k3s-server-3.cluster  Ready    control-plane,master   30d   v1.28.5+k3s1
```

**What to Look For:**

- All nodes should show `STATUS: Ready`
- No nodes should be in `NotReady` or `Unknown` state
- Version should be consistent across nodes

### Detailed Node Information

Get detailed information about a specific node:

```bash
kubectl describe node <node-name>
```

This shows:

- Node conditions (Ready, MemoryPressure, DiskPressure, PIDPressure)
- Resource capacity and allocation
- System information
- Recent events

**Check Node Conditions:**

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,STATUS:.status.conditions[-1].type,REASON:.status.conditions[-1].reason
```

### Check Cluster Components

Verify all system components are running:

```bash
kubectl get pods -n kube-system
```

**Key Components to Verify:**

- `coredns-*` - DNS service
- `local-path-provisioner-*` - Storage provisioner (if using)
- `traefik-*` - Ingress controller (if enabled)
- `svclb-*` - Service load balancer (if enabled)

For HA clusters, also check:

- `etcd-*` - etcd pods (should match number of control plane nodes)

### Check All Namespaces

Get an overview of pods across all namespaces:

```bash
kubectl get pods -A
```

Look for pods in `Error`, `CrashLoopBackOff`, or `Pending` states.

## Component-Specific Health Checks

### etcd Health (HA Clusters)

For HA clusters with embedded etcd, check etcd health:

```bash
kubectl get pods -n kube-system | grep etcd
```

All etcd pods should be `Running`. Check etcd logs if issues:

```bash
kubectl logs -n kube-system etcd-<node-name>
```

### DNS Health

Test DNS resolution:

```bash
# Create a test pod
kubectl run -it --rm --restart=Never test-dns --image=busybox -- nslookup kubernetes.default

# Should resolve to the Kubernetes service IP
```

### Storage Health

If using Longhorn, check storage system:

```bash
kubectl get pods -n longhorn-system
kubectl get volumes -n longhorn-system
```

## Resource Monitoring

### Node Resource Usage

Check CPU and memory usage across nodes:

```bash
kubectl top nodes
```

**Expected Output:**

```bash
NAME                  CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
k3s-server-1.cluster  500m         12%    2Gi             25%
k3s-server-2.cluster  450m         11%    1.8Gi           22%
k3s-server-3.cluster  520m         13%    2.1Gi           26%
```

### Pod Resource Usage

Check resource usage by pod:

```bash
kubectl top pods -A
```

### Disk Usage

Check disk usage on nodes (SSH into each node):

```bash
df -h
```

Pay attention to:

- `/var/lib/rancher/k3s` - K3s data directory
- Root filesystem usage
- Any mount points for persistent storage

## Application Health Checks

### Check Service Endpoints

Verify services have healthy endpoints:

```bash
kubectl get endpoints -A
```

Each service should have at least one endpoint (unless intentionally scaled to
zero).

### Check Ingress Status

If using Traefik or another ingress controller:

```bash
kubectl get ingress -A
```

Verify ingress resources are properly configured and receiving traffic.

### Application Pod Health

Check specific application pods:

```bash
kubectl get pods -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
```

Look for:

- Pod status (Running, Pending, Error, CrashLoopBackOff)
- Restart counts (should be low)
- Resource limits and requests

## Log Monitoring

### View Recent Events

Check for recent cluster events:

```bash
kubectl get events -A --sort-by='.lastTimestamp' | tail -20
```

### Check Component Logs

View logs for specific components:

```bash
# K3s service logs (on the node)
sudo journalctl -u k3s -n 100

# Kubernetes component logs
kubectl logs -n kube-system <component-pod-name>
```

### Application Logs

Check application logs:

```bash
kubectl logs -n <namespace> <pod-name>
kubectl logs -n <namespace> <pod-name> --previous  # Previous container instance
```

## Automated Health Checks

### Create a Health Check Script

You can create a simple script to run regular health checks:

```bash
#!/bin/bash
# health-check.sh

echo "=== Node Status ==="
kubectl get nodes

echo -e "\n=== System Pods ==="
kubectl get pods -n kube-system | grep -v Running

echo -e "\n=== Resource Usage ==="
kubectl top nodes

echo -e "\n=== Recent Events ==="
kubectl get events -A --sort-by='.lastTimestamp' | tail -10
```

Make it executable and run periodically:

```bash
chmod +x health-check.sh
./health-check.sh
```

### Set Up Cron Job

Schedule regular health checks:

```bash
# Add to crontab
crontab -e

# Run health check every hour
0 * * * * /path/to/health-check.sh >> /var/log/k3s-health.log 2>&1
```

## Health Check Checklist

Run these checks regularly (weekly recommended):

- [ ] All nodes are `Ready`
- [ ] No pods in `Error` or `CrashLoopBackOff` state
- [ ] System components are running
- [ ] Resource usage is within acceptable limits
- [ ] No disk space issues
- [ ] DNS resolution working
- [ ] Services have healthy endpoints
- [ ] No critical events in recent logs
- [ ] etcd health (for HA clusters)
- [ ] Storage system healthy (if using Longhorn)

## Alerting Thresholds

Consider setting up alerts for:

- **Node NotReady** - Immediate attention required
- **Pod CrashLoopBackOff** - Application issue
- **High CPU Usage** (>80%) - May need scaling
- **High Memory Usage** (>85%) - Risk of OOM kills
- **Disk Usage** (>85%) - Risk of node issues
- **Pod Restarts** (>5 in 1 hour) - Application instability

## Troubleshooting Health Issues

If health checks reveal issues:

1. **Node Not Ready:**
   - Check node connectivity: `ping <node-ip>`
   - Verify K3s service: `sudo systemctl status k3s` (on the node)
   - Review node logs: `sudo journalctl -u k3s -n 100`

2. **Pod Not Starting:**
   - Check pod events: `kubectl describe pod <pod-name>`
   - Review pod logs: `kubectl logs <pod-name>`
   - Verify resource availability: `kubectl describe node`

3. **High Resource Usage:**
   - Identify resource-heavy pods: `kubectl top pods -A`
   - Check resource limits: `kubectl describe pod <pod-name>`
   - Consider scaling or resource optimization

## Related Documentation

- [K3s Maintenance Overview](./k3s-maintenance) - Maintenance overview
- [Troubleshooting](./k3s-maintenance-troubleshooting) - Detailed
  troubleshooting guide
- [Updating K3s](./k3s-maintenance-updates) - Post-update health verification
