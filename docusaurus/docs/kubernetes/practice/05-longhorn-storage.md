---
title: 'Exercise 5: Longhorn Storage'
---

## Objective

Learn how to use Longhorn for distributed, replicated storage in your K3s
cluster. Understand Longhorn-specific features and volume management.

## Prerequisites

- Completed [Exercise 4: Persistent Volumes](./04-persistent-volumes)
- Longhorn installed in your cluster (check with
  `kubectl get pods -n longhorn-system`)

## Exercise: Use Longhorn for Distributed Storage

### Step 1: Verify Longhorn Installation

First, let's make sure Longhorn is running:

```bash
# Check Longhorn pods
kubectl get pods -n longhorn-system

# Check StorageClass
kubectl get storageclass longhorn
```

If Longhorn isn't installed, you'll need to install it first (see
[Longhorn Setup](../k3s-backup-longhorn) documentation).

### Step 2: Create a PVC Using Longhorn

Longhorn provides the `longhorn` StorageClass. Let's create a PVC that uses it
explicitly.

**YAML Version:** Create `longhorn-pvc.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-05
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: longhorn-volume
  namespace: practice-05
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 2Gi
```

**Apply:**

```bash
kubectl apply -f longhorn-pvc.yaml
```

**Verify:**

```bash
kubectl get pvc -n practice-05
```

Wait for `Bound` status.

### Step 3: Check Longhorn Volume

Longhorn creates a volume resource you can inspect:

```bash
# List Longhorn volumes
kubectl get volumes -n longhorn-system

# Describe the volume (replace with your volume name)
kubectl get volumes -n longhorn-system -o name | head -1 | xargs kubectl describe -n longhorn-system
```

### Step 4: Create a Stateful Application

Let's create a database-like application that benefits from persistent storage.

**YAML Version:** Create `stateful-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-app
  namespace: practice-05
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database-app
  template:
    metadata:
      labels:
        app: database-app
    spec:
      containers:
        - name: db
          image: postgres:15-alpine
          env:
            - name: POSTGRES_DB
              value: myapp
            - name: POSTGRES_USER
              value: admin
            - name: POSTGRES_PASSWORD
              value: password123
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: longhorn-volume
```

**Apply:**

```bash
kubectl apply -f stateful-app.yaml
```

**Wait for pod:**

```bash
kubectl wait --for=condition=ready pod -l app=database-app -n practice-05 --timeout=120s
```

### Step 5: Test Data Persistence

Let's create some data and verify it persists:

```bash
# Create a test database
kubectl exec -it deployment/database-app -n practice-05 -- \
  psql -U admin -d myapp -c "CREATE TABLE test (id SERIAL, data TEXT);"

# Insert some data
kubectl exec -it deployment/database-app -n practice-05 -- \
  psql -U admin -d myapp -c "INSERT INTO test (data) VALUES ('This data should persist');"

# Verify data exists
kubectl exec -it deployment/database-app -n practice-05 -- \
  psql -U admin -d myapp -c "SELECT * FROM test;"
```

### Step 6: Test Longhorn Replication

Longhorn replicates data across nodes. Let's verify the volume is replicated:

```bash
# Check volume replication status in Longhorn
kubectl get volumes -n longhorn-system

# Check Longhorn UI (if accessible)
# kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
```

## Verification

Verify Longhorn storage is working correctly:

```bash
# Check PVC is bound
kubectl get pvc -n practice-05

# Check Longhorn volume exists
kubectl get volumes -n longhorn-system

# Verify data persists after pod restart
kubectl delete pod -l app=database-app -n practice-05
sleep 15
kubectl exec -it deployment/database-app -n practice-05 -- \
  psql -U admin -d myapp -c "SELECT * FROM test;"
```

## Understanding What Happened

- **Longhorn StorageClass**: Provides distributed, replicated storage
- **Volume Replication**: Longhorn replicates data across multiple nodes for
  redundancy
- **Persistent Storage**: Data survives pod restarts and node failures
- **Stateful Applications**: Perfect for databases and applications that need
  persistent data

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-05
```

This will delete the PVC and the Longhorn volume.

## Next Steps

→ [Exercise 6: Services and Networking](./06-services-and-networking)

## Additional Practice

1. Check Longhorn volume details:
   `kubectl get volumes -n longhorn-system -o yaml`
2. Create multiple PVCs and see how Longhorn manages them
3. Check Longhorn UI to see volume replication status (if you have access to it)
