---
title: 'Exercise 7: CloudNative PG Basics'
---

## Objective

Learn how to create and manage PostgreSQL clusters using CloudNative PG. This
exercise introduces database management in Kubernetes.

## Prerequisites

- Completed [Exercise 6: Services and Networking](./services-and-networking)
- CloudNative PG operator installed (check with
  `kubectl get pods -n cnpg-system`)
- Longhorn storage available

Verify CloudNative PG is installed:

```bash
kubectl get pods -n cnpg-system
```

You should see the `cloudnative-pg-controller-manager` pod running.

## Exercise: Create a PostgreSQL Cluster

### Step 1: Create Namespace and Secret

PostgreSQL needs credentials. Let's create a secret for the superuser.

**YAML Version:** Create `postgres-setup.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-07
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
  namespace: practice-07
type: Opaque
stringData:
  username: postgres
  password: mysecurepassword123
```

**Apply:**

```bash
kubectl apply -f postgres-setup.yaml
```

### Step 2: Create PostgreSQL Cluster

Now let's create a PostgreSQL cluster with CloudNative PG.

**YAML Version:** Create `postgres-cluster.yaml`:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: practice-postgres
  namespace: practice-07
spec:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:15
  primaryUpdateMethod: switchover
  storage:
    size: 2Gi
    storageClass: longhorn
  superuserSecret:
    name: postgres-credentials
  bootstrap:
    initdb:
      database: practice_db
      owner: app_user
      secret:
        name: postgres-credentials
```

**Apply:**

```bash
kubectl apply -f postgres-cluster.yaml
```

**Wait for cluster to be ready:**

```bash
kubectl wait --for=condition=ready cluster practice-postgres -n practice-07 --timeout=300s
```

This may take a few minutes as PostgreSQL initializes.

### Step 3: Verify Cluster Status

Check that the cluster is running:

```bash
# Check cluster status
kubectl get cluster practice-postgres -n practice-07

# Check pods
kubectl get pods -n practice-07 -l cnpg.io/cluster=practice-postgres

# Check services (CloudNative PG creates multiple services)
kubectl get svc -n practice-07
```

You should see:

- `practice-postgres-r` - Read service (any replica)
- `practice-postgres-ro` - Read-only service (replicas only)
- `practice-postgres-rw` - Read-write service (primary only)

### Step 4: Connect to the Database

Let's connect to the database and create some data.

**Get the primary pod name:**

```bash
PRIMARY_POD=$(kubectl get pods -n practice-07 -l cnpg.io/cluster=practice-postgres,role=primary -o jsonpath='{.items[0].metadata.name}')
echo $PRIMARY_POD
```

**Connect to PostgreSQL:**

```bash
kubectl exec -it $PRIMARY_POD -n practice-07 -- psql -U postgres -d practice_db
```

**In the PostgreSQL prompt, run:**

```sql
-- Create a table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- Insert some data
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- Query the data
SELECT * FROM users;

-- Exit
\q
```

### Step 5: Use the Read-Write Service

CloudNative PG provides services for different access patterns. Let's use the
read-write service.

**Port forward to the read-write service:**

```bash
kubectl port-forward svc/practice-postgres-rw 5432:5432 -n practice-07
```

**In another terminal, connect (if you have psql locally):**

```bash
# If you have psql installed locally
psql -h localhost -U postgres -d practice_db
```

Or use kubectl exec as shown above.

## Verification

Verify the PostgreSQL cluster is working:

```bash
# Check cluster is ready
kubectl get cluster practice-postgres -n practice-07

# Check pods are running
kubectl get pods -n practice-07

# Check services
kubectl get svc -n practice-07

# Verify data exists
PRIMARY_POD=$(kubectl get pods -n practice-07 -l role=primary -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $PRIMARY_POD -n practice-07 -- \
  psql -U postgres -d practice_db -c "SELECT * FROM users;"
```

## Understanding What Happened

- **CloudNative PG Cluster**: Manages PostgreSQL instances in Kubernetes
- **Storage**: Uses Longhorn for persistent storage
- **Services**: Automatically creates read, read-only, and read-write services
- **High Availability**: Can scale to multiple instances (we used 1 for
  simplicity)
- **Secrets**: Credentials managed via Kubernetes secrets

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-07
```

This will delete the cluster and all associated resources.

## Next Steps

→ [Exercise 8: CloudNative PG Advanced](./cloudnative-pg-advanced)

## Additional Practice

1. Scale the cluster to 3 instances: Update `instances: 3` in the cluster spec
2. Check the different service types and understand when to use each
3. Create a new database in the cluster
4. Check cluster status:
   `kubectl describe cluster practice-postgres -n practice-07`
