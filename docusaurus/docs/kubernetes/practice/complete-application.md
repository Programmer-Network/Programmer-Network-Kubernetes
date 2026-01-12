---
title: 'Exercise 10: Complete Application'
---

## Objective

Build a complete, production-like application stack using everything you've
learned: Deployments, Services, ConfigMaps, Secrets, Persistent Volumes,
Longhorn, and CloudNative PG.

## Prerequisites

- Completed all previous exercises (01-08)
- Understanding of all concepts covered so far
- CloudNative PG and Longhorn installed

## Exercise: Full-Stack Application

We'll build a complete application with:

- Web frontend (nginx)
- Backend API (simple app)
- PostgreSQL database (CloudNative PG)
- Persistent storage (Longhorn)
- Configuration management (ConfigMaps/Secrets)
- Services for networking

### Step 1: Create Namespace and Database

**YAML Version:** Create `01-database.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-complete
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
  namespace: practice-complete
type: Opaque
stringData:
  username: postgres
  password: securepassword123
---
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: app-database
  namespace: practice-complete
spec:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:15
  primaryUpdateMethod: switchover
  storage:
    size: 5Gi
    storageClass: longhorn
  superuserSecret:
    name: postgres-credentials
  bootstrap:
    initdb:
      database: myapp
      owner: app_user
      secret:
        name: postgres-credentials
```

**Apply:**

```bash
kubectl apply -f 01-database.yaml
```

**Wait for database:**

```bash
kubectl wait --for=condition=ready cluster app-database -n practice-complete --timeout=300s
```

### Step 2: Create Application Configuration

**YAML Version:** Create `02-config.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: practice-complete
data:
  APP_NAME: 'Complete Practice App'
  APP_ENV: 'production'
  DATABASE_HOST: 'app-database-rw'
  DATABASE_PORT: '5432'
  DATABASE_NAME: 'myapp'
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: practice-complete
type: Opaque
stringData:
  DATABASE_USER: 'app_user'
  DATABASE_PASSWORD: 'securepassword123'
  API_KEY: 'secret-api-key-12345'
```

**Apply:**

```bash
kubectl apply -f 02-config.yaml
```

### Step 3: Create Backend API

**YAML Version:** Create `03-backend.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: practice-complete
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: api
          image: postgres:15-alpine
          command: ['/bin/sh']
          args:
            - -c
            - |
              echo "Backend API Starting..."
              echo "Database: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME"
              echo "API Key: $API_KEY"
              # Simulate API server
              while true; do
                echo "$(date): API server running, connected to database"
                PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT NOW();" 2>/dev/null || echo "Database connection check..."
                sleep 30
              done
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: backend-api
  namespace: practice-complete
spec:
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080
  type: ClusterIP
```

**Apply:**

```bash
kubectl apply -f 03-backend.yaml
```

### Step 4: Create Frontend with Persistent Storage

**YAML Version:** Create `04-frontend.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: frontend-storage
  namespace: practice-complete
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: practice-complete
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
          volumeMounts:
            - name: storage
              mountPath: /usr/share/nginx/html/data
            - name: config
              mountPath: /etc/nginx/conf.d
          env:
            - name: BACKEND_URL
              value: 'http://backend-api:8080'
      volumes:
        - name: storage
          persistentVolumeClaim:
            claimName: frontend-storage
        - name: config
          configMap:
            name: app-config
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: practice-complete
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

**Apply:**

```bash
kubectl apply -f 04-frontend.yaml
```

**Wait for LoadBalancer IP:**

```bash
kubectl get svc frontend -n practice-complete -w
```

### Step 5: Initialize Database Schema

**Create database schema:**

```bash
PRIMARY_POD=$(kubectl get pods -n practice-complete -l cnpg.io/cluster=app-database,role=primary -o jsonpath='{.items[0].metadata.name}')

kubectl exec -it $PRIMARY_POD -n practice-complete -- \
  psql -U postgres -d myapp -c "
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(200),
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    INSERT INTO users (name, email) VALUES
      ('Alice', 'alice@example.com'),
      ('Bob', 'bob@example.com');

    INSERT INTO posts (user_id, title, content) VALUES
      (1, 'First Post', 'This is my first post!'),
      (2, 'Hello World', 'Hello from Bob!');
  "
```

## Verification

Verify the complete application stack:

```bash
# Check all components
kubectl get all -n practice-complete

# Check database cluster
kubectl get cluster app-database -n practice-complete

# Check persistent volumes
kubectl get pvc -n practice-complete

# Check services
kubectl get svc -n practice-complete

# Check backend logs
kubectl logs -l app=backend -n practice-complete

# Verify database data
PRIMARY_POD=$(kubectl get pods -n practice-complete -l role=primary -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $PRIMARY_POD -n practice-complete -- \
  psql -U postgres -d myapp -c "SELECT * FROM users;"
kubectl exec -it $PRIMARY_POD -n practice-complete -- \
  psql -U postgres -d myapp -c "SELECT * FROM posts;"

# Test frontend (if LoadBalancer IP assigned)
# curl http://<external-ip>
```

## Understanding What Happened

You've built a complete application stack with:

- **Database**: CloudNative PG managing PostgreSQL with persistent storage
- **Backend**: API service connecting to database via ConfigMap/Secret
- **Frontend**: Web server with persistent storage for static files
- **Networking**: Services connecting components
- **Storage**: Longhorn providing persistent volumes
- **Configuration**: ConfigMaps and Secrets managing app config
- **High Availability**: Multiple replicas for frontend and backend

This is a production-like setup!

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-complete
```

This will clean up everything: database, applications, storage, and
configuration.

## Congratulations! 🎉

You've completed the practice exercises! You now understand:

- Basic Kubernetes resources
- Namespace organization
- Configuration management
- Persistent storage with Longhorn
- Database management with CloudNative PG
- Complete application stacks

## Next Steps

- Explore [K3s Maintenance](../k3s-maintenance) guides
- Learn about [Backup Strategies](../k3s-backup)
- Check out [ArgoCD Setup](../setup-argocd) for GitOps
- Review [Anatomy of kubectl Command](../anatomy-of-kubectl-command.mdx) for
  command reference

## Additional Practice Ideas

1. Add an Ingress resource to route traffic to the frontend
2. Scale the backend to 5 replicas and observe load distribution
3. Create a backup of the database using CloudNative PG backups
4. Add monitoring and logging
5. Implement health checks and readiness probes
6. Set up resource limits and requests
