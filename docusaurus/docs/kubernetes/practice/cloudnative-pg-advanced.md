---
title: 'Exercise 8: CloudNative PG Advanced'
---

## Objective

Learn advanced CloudNative PG features including multi-instance clusters,
backups, and connecting applications to databases.

## Prerequisites

- Completed [Exercise 7: CloudNative PG Basics](./cloudnative-pg-basics)
- Understanding of PostgreSQL basics
- CloudNative PG operator installed

## Exercise: Multi-Instance Cluster and Application Integration

### Step 1: Create a High-Availability PostgreSQL Cluster

Let's create a 3-instance cluster for high availability.

**YAML Version:** Create `ha-postgres-cluster.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-08
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
  namespace: practice-08
type: Opaque
stringData:
  username: postgres
  password: mysecurepassword123
---
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ha-postgres
  namespace: practice-08
spec:
  instances: 3
  imageName: ghcr.io/cloudnative-pg/postgresql:15
  primaryUpdateMethod: switchover
  storage:
    size: 2Gi
    storageClass: longhorn
  superuserSecret:
    name: postgres-credentials
  bootstrap:
    initdb:
      database: app_db
      owner: app_user
      secret:
        name: postgres-credentials
```

**Apply:**

```bash
kubectl apply -f ha-postgres-cluster.yaml
```

**Wait for cluster:**

```bash
kubectl wait --for=condition=ready cluster ha-postgres -n practice-08 --timeout=300s
```

**Verify HA setup:**

```bash
# Check all instances are running
kubectl get pods -n practice-08 -l cnpg.io/cluster=ha-postgres

# Check which is primary
kubectl get pods -n practice-08 -l cnpg.io/cluster=ha-postgres -l role=primary

# Check replicas
kubectl get pods -n practice-08 -l cnpg.io/cluster=ha-postgres -l role=replica
```

### Step 2: Create an Application That Uses the Database

Let's create a simple application that connects to the database.

**YAML Version:** Create `app-with-db.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: practice-08
data:
  DATABASE_HOST: ha-postgres-rw
  DATABASE_PORT: '5432'
  DATABASE_NAME: app_db
---
apiVersion: v1
kind: Secret
metadata:
  name: app-db-credentials
  namespace: practice-08
type: Opaque
stringData:
  DATABASE_USER: app_user
  DATABASE_PASSWORD: mysecurepassword123
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: practice-08
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: app
          image: postgres:15-alpine
          command: ['/bin/sh']
          args:
            - -c
            - |
              echo "Connecting to database..."
              echo "Host: $DATABASE_HOST"
              echo "Port: $DATABASE_PORT"
              echo "Database: $DATABASE_NAME"
              echo "User: $DATABASE_USER"
              # Test connection
              PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT version();"
              echo "Connection successful!"
              sleep 3600
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-db-credentials
---
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: practice-08
spec:
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

**Apply:**

```bash
kubectl apply -f app-with-db.yaml
```

**Check app logs:**

```bash
kubectl logs -l app=web-app -n practice-08
```

You should see the database connection information and a successful connection
message.

### Step 3: Test High Availability

Let's test what happens when the primary fails.

**Get primary pod:**

```bash
PRIMARY_POD=$(kubectl get pods -n practice-08 -l role=primary -o jsonpath='{.items[0].metadata.name}')
echo "Primary pod: $PRIMARY_POD"
```

**Create some data:**

```bash
kubectl exec -it $PRIMARY_POD -n practice-08 -- \
  psql -U postgres -d app_db -c "CREATE TABLE IF NOT EXISTS test_data (id SERIAL, data TEXT);"

kubectl exec -it $PRIMARY_POD -n practice-08 -- \
  psql -U postgres -d app_db -c "INSERT INTO test_data (data) VALUES ('This should survive failover');"
```

**Simulate primary failure (delete the primary pod):**

```bash
kubectl delete pod $PRIMARY_POD -n practice-08
```

**Watch CloudNative PG promote a new primary:**

```bash
kubectl get pods -n practice-08 -l cnpg.io/cluster=ha-postgres -w
```

After a few moments, a replica will be promoted to primary.

**Verify data survived:**

```bash
NEW_PRIMARY=$(kubectl get pods -n practice-08 -l role=primary -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $NEW_PRIMARY -n practice-08 -- \
  psql -U postgres -d app_db -c "SELECT * FROM test_data;"
```

The data should still be there!

## Verification

Verify the HA cluster and application integration:

```bash
# Check cluster status
kubectl get cluster ha-postgres -n practice-08

# Check all instances
kubectl get pods -n practice-08 -l cnpg.io/cluster=ha-postgres

# Verify application can connect
kubectl logs -l app=web-app -n practice-08

# Check data persistence after failover
kubectl get pods -n practice-08 -l role=primary
PRIMARY=$(kubectl get pods -n practice-08 -l role=primary -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $PRIMARY -n practice-08 -- \
  psql -U postgres -d app_db -c "SELECT COUNT(*) FROM test_data;"
```

## Understanding What Happened

- **High Availability**: 3-instance cluster provides redundancy
- **Automatic Failover**: CloudNative PG promotes a replica when primary fails
- **Service Abstraction**: Using `ha-postgres-rw` service means apps don't need
  to know which pod is primary
- **Data Persistence**: Data survives pod failures and failovers
- **Application Integration**: Apps connect via services, not direct pod access

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-08
```

## Next Steps

→ [Exercise 9: Ingress with Traefik](./ingress-with-traefik)

## Additional Practice

1. Scale the cluster to 5 instances and observe replication
2. Check cluster events: `kubectl get events -n practice-08`
3. Manually trigger a switchover:
   `kubectl cnpg promote <replica-pod-name> -n practice-08` (if cnpg plugin is
   installed)
4. Monitor replication lag between primary and replicas
