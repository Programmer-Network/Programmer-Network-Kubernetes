---
title: 'Exercise 4: Persistent Volumes'
---

## Objective

Learn how to use PersistentVolumeClaims (PVCs) to provide storage for
applications. Understand the difference between ephemeral and persistent
storage.

## Prerequisites

- Completed [Exercise 3: ConfigMaps and Secrets](./configmaps-and-secrets)
- Understanding of Deployments and Pods

## Exercise: Create an Application with Persistent Storage

### Step 1: Create a PersistentVolumeClaim

A PVC requests storage from the cluster. The cluster provisions it using a
StorageClass.

**YAML Version:** Create `namespace-pvc.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-04
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
  namespace: practice-04
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: longhorn
```

**Apply:**

```bash
kubectl apply -f namespace-pvc.yaml
```

**Verify:**

```bash
kubectl get pvc -n practice-04
```

Wait until the PVC shows `Bound` status. This means storage has been
provisioned.

### Step 2: Create a Deployment Using the PVC

Now let's create a deployment that uses this persistent storage.

**YAML Version:** Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: storage-app
  namespace: practice-04
spec:
  replicas: 1
  selector:
    matchLabels:
      app: storage-app
  template:
    metadata:
      labels:
        app: storage-app
    spec:
      containers:
        - name: app
          image: busybox
          command: ['/bin/sh']
          args:
            - -c
            - |
              echo "Writing to persistent storage..." > /data/message.txt
              echo "Current time: $(date)" >> /data/message.txt
              echo "Data persisted!" >> /data/message.txt
              cat /data/message.txt
              sleep 3600
          volumeMounts:
            - name: storage
              mountPath: /data
      volumes:
        - name: storage
          persistentVolumeClaim:
            claimName: app-storage
```

**Apply:**

```bash
kubectl apply -f deployment.yaml
```

**Wait for pod:**

```bash
kubectl wait --for=condition=ready pod -l app=storage-app -n practice-04 --timeout=60s
```

### Step 3: Verify Data Persistence

Let's verify that data is being written to persistent storage:

```bash
# Check the pod logs
kubectl logs -l app=storage-app -n practice-04

# Check the data in the pod
kubectl exec -it deployment/storage-app -n practice-04 -- cat /data/message.txt
```

### Step 4: Test Data Persistence

The real test of persistent storage is that data survives pod restarts. Let's
test this:

```bash
# Delete the pod (it will be recreated by the Deployment)
kubectl delete pod -l app=storage-app -n practice-04

# Wait for new pod
kubectl wait --for=condition=ready pod -l app=storage-app -n practice-04 --timeout=60s

# Check if data still exists
kubectl exec -it deployment/storage-app -n practice-04 -- cat /data/message.txt
```

The data should still be there! This proves the storage is persistent.

## Verification

Verify persistent storage is working:

```bash
# Check PVC status
kubectl get pvc -n practice-04

# Check pod is using the volume
kubectl describe pod -l app=storage-app -n practice-04 | grep -A 5 "Volumes:"

# Verify data persistence after pod restart
kubectl delete pod -l app=storage-app -n practice-04
sleep 10
kubectl exec -it deployment/storage-app -n practice-04 -- ls -la /data
```

## Understanding What Happened

- **PersistentVolumeClaim (PVC)**: Requests storage from the cluster
- **StorageClass**: Defines how storage is provisioned (we used `longhorn`)
- **Volume Mount**: Makes the storage available inside the container
- **Persistence**: Data survives pod restarts and deletions

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-04
```

This will also delete the PVC and the underlying volume.

## Next Steps

→ [Exercise 5: Longhorn Storage](./longhorn-storage)

## Additional Practice

1. Check available StorageClasses: `kubectl get storageclass`
2. Create a PVC with a different size: Change `storage: 1Gi` to `storage: 2Gi`
3. Try mounting the same PVC in multiple pods (hint: ReadWriteOnce means only
   one pod can mount it)
