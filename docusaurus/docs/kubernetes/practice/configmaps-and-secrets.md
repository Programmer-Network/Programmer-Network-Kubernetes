---
title: 'Exercise 3: ConfigMaps and Secrets'
---

## Objective

Learn how to manage configuration data and sensitive information using
ConfigMaps and Secrets. These are essential for making applications configurable
and secure.

## Prerequisites

- Completed
  [Exercise 2: Namespaces and Resources](./namespaces-and-resources)
- Understanding of Deployments and Pods

## Exercise: Configure an Application

### Step 1: Create a ConfigMap

ConfigMaps store non-sensitive configuration data. Let's create one for
application settings.

**Command:**

```bash
kubectl create configmap app-config \
  --from-literal=database_host=postgres.example.com \
  --from-literal=database_port=5432 \
  --from-literal=app_name=my-app \
  -n practice-03
```

**YAML Version:** Create `configmap.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-03
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: practice-03
data:
  database_host: postgres.example.com
  database_port: '5432'
  app_name: my-app
  config.properties: |
    server.port=8080
    logging.level=INFO
    feature.flag.enabled=true
```

**Apply:**

```bash
kubectl apply -f configmap.yaml
```

**Verify:**

```bash
kubectl get configmap app-config -n practice-03
kubectl describe configmap app-config -n practice-03
```

### Step 2: Create a Secret

Secrets store sensitive data like passwords and API keys. Let's create one for
database credentials.

**Command:**

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=secretpassword123 \
  -n practice-03
```

**YAML Version:** Create `secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: practice-03
type: Opaque
stringData:
  username: admin
  password: secretpassword123
```

**Apply:**

```bash
kubectl apply -f secret.yaml
```

**Verify:**

```bash
kubectl get secret db-credentials -n practice-03
```

Note: Secrets are base64 encoded. To view (decode) them:

```bash
kubectl get secret db-credentials -n practice-03 -o jsonpath='{.data.password}' | base64 -d
echo
```

### Step 3: Use ConfigMap and Secret in a Deployment

Now let's create a deployment that uses both the ConfigMap and Secret.

**YAML Version:** Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configured-app
  namespace: practice-03
spec:
  replicas: 1
  selector:
    matchLabels:
      app: configured-app
  template:
    metadata:
      labels:
        app: configured-app
    spec:
      containers:
        - name: app
          image: busybox
          command: ['/bin/sh']
          args:
            - -c
            - |
              echo "App Name: $APP_NAME"
              echo "DB Host: $DB_HOST"
              echo "DB Port: $DB_PORT"
              echo "DB User: $DB_USERNAME"
              echo "Config file contents:"
              cat /etc/config/config.properties
              sleep 3600
          env:
            # From ConfigMap
            - name: APP_NAME
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: app_name
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: database_host
            - name: DB_PORT
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: database_port
            # From Secret
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
          volumeMounts:
            - name: config-volume
              mountPath: /etc/config
      volumes:
        - name: config-volume
          configMap:
            name: app-config
```

**Apply:**

```bash
kubectl apply -f deployment.yaml
```

**Wait for pod to be ready:**

```bash
kubectl wait --for=condition=ready pod -l app=configured-app -n practice-03 --timeout=60s
```

### Step 4: Verify Configuration

Check that the pod is using the configuration:

```bash
kubectl logs -l app=configured-app -n practice-03
```

You should see the environment variables and config file contents printed.

## Verification

Verify everything is configured correctly:

```bash
# Check ConfigMap exists
kubectl get configmap app-config -n practice-03

# Check Secret exists (note: values are encoded)
kubectl get secret db-credentials -n practice-03

# Check pod is using the config
kubectl get pods -n practice-03
kubectl logs -l app=configured-app -n practice-03

# Check environment variables in the pod
kubectl exec -it deployment/configured-app -n practice-03 -- env | grep -E "APP_NAME|DB_"
```

## Understanding What Happened

- **ConfigMap**: Stores non-sensitive configuration as key-value pairs or files
- **Secret**: Stores sensitive data (base64 encoded by default)
- **Environment Variables**: Injected from ConfigMap/Secret using `valueFrom`
- **Volume Mounts**: ConfigMaps can be mounted as files in containers

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-03
```

## Next Steps

→ [Exercise 4: Persistent Volumes](./persistent-volumes)

## Additional Practice

1. Update the ConfigMap and see if the pod picks up changes (hint: it won't
   automatically - you need to restart the pod)
2. Create a Secret from a file:
   `kubectl create secret generic file-secret --from-file=./secret-file.txt -n practice-03`
3. Mount a Secret as a volume instead of environment variables
