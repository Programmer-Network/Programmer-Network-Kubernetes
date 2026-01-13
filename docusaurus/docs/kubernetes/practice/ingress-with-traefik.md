---
title: 'Exercise 9: Ingress with Traefik'
---

## Objective

Learn how to expose applications to external traffic using Ingress resources
with Traefik, the default ingress controller in K3s.

## Prerequisites

- Completed [Exercise 8: CloudNative PG Advanced](./cloudnative-pg-advanced)
- Understanding of Services (ClusterIP, LoadBalancer)
- K3s cluster running (Traefik is installed by default)

## Understanding Ingress

Before we start, let's understand what Ingress does:

- **Without Ingress**: Each service needs its own LoadBalancer IP
- **With Ingress**: One entry point routes to many services based on
  hostname/path

```
                          ┌─────────────┐
                          │   Ingress   │
  Internet ──────────────►│  (Traefik)  │
                          └──────┬──────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │ Service A   │        │ Service B   │        │ Service C   │
   │ api.app.com │        │ web.app.com │        │ app.com/api │
   └─────────────┘        └─────────────┘        └─────────────┘
```

## Exercise: Expose Applications via Ingress

### Step 1: Verify Traefik is Running

First, confirm Traefik is installed:

```bash
# Check Traefik pods
kubectl get pods -n kube-system | grep traefik

# Check Traefik service
kubectl get svc -n kube-system | grep traefik
```

You should see `traefik` pods running and a LoadBalancer service.

### Step 2: Create Namespace and Applications

Let's create two web applications to demonstrate routing.

**YAML Version:** Create `apps-setup.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: practice-09
---
# Application 1: Main website
apiVersion: apps/v1
kind: Deployment
metadata:
  name: website
  namespace: practice-09
spec:
  replicas: 2
  selector:
    matchLabels:
      app: website
  template:
    metadata:
      labels:
        app: website
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
          volumeMounts:
            - name: html
              mountPath: /usr/share/nginx/html
      volumes:
        - name: html
          configMap:
            name: website-content
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: website-content
  namespace: practice-09
data:
  index.html: |
    <!DOCTYPE html>
    <html>
    <head><title>Main Website</title></head>
    <body>
      <h1>Welcome to the Main Website</h1>
      <p>This is served via Ingress!</p>
    </body>
    </html>
---
apiVersion: v1
kind: Service
metadata:
  name: website
  namespace: practice-09
spec:
  selector:
    app: website
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
---
# Application 2: API service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: practice-09
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
          volumeMounts:
            - name: html
              mountPath: /usr/share/nginx/html
      volumes:
        - name: html
          configMap:
            name: api-content
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-content
  namespace: practice-09
data:
  index.html: |
    {"status": "ok", "service": "api", "message": "API is running via Ingress"}
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: practice-09
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

**Apply:**

```bash
kubectl apply -f apps-setup.yaml
```

**Wait for pods:**

```bash
kubectl wait --for=condition=ready pod -l app=website -n practice-09 --timeout=60s
kubectl wait --for=condition=ready pod -l app=api -n practice-09 --timeout=60s
```

### Step 3: Create Ingress for Host-Based Routing

Route traffic based on hostname (most common pattern).

**YAML Version:** Create `ingress-host.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-routing
  namespace: practice-09
  annotations:
    spec.ingressClassName: traefik
spec:
  rules:
    # Route website.local to the website service
    - host: website.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: website
                port:
                  number: 80
    # Route api.local to the api service
    - host: api.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
```

**Apply:**

```bash
kubectl apply -f ingress-host.yaml
```

**Verify:**

```bash
kubectl get ingress -n practice-09
kubectl describe ingress host-routing -n practice-09
```

### Step 4: Test the Ingress

Get the Traefik LoadBalancer IP:

```bash
TRAEFIK_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Traefik IP: $TRAEFIK_IP"
```

Test with curl using the Host header:

```bash
# Test website
curl -H "Host: website.local" http://$TRAEFIK_IP

# Test API
curl -H "Host: api.local" http://$TRAEFIK_IP
```

For browser access, add entries to `/etc/hosts`:

```bash
# Add to /etc/hosts (replace with your Traefik IP)
echo "$TRAEFIK_IP website.local api.local" | sudo tee -a /etc/hosts
```

Then open `http://website.local` or `http://api.local` in your browser.

### Step 5: Create Ingress for Path-Based Routing

Route traffic based on URL path (useful for single domain).

**YAML Version:** Create `ingress-path.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-routing
  namespace: practice-09
  annotations:
    spec.ingressClassName: traefik
spec:
  rules:
    - host: app.local
      http:
        paths:
          # /api/* goes to api service
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
          # Everything else goes to website
          - path: /
            pathType: Prefix
            backend:
              service:
                name: website
                port:
                  number: 80
```

**Apply:**

```bash
kubectl apply -f ingress-path.yaml
```

**Test:**

```bash
# Add to /etc/hosts if not done
echo "$TRAEFIK_IP app.local" | sudo tee -a /etc/hosts

# Test website (root path)
curl http://app.local/

# Test API (api path)
curl http://app.local/api
```

### Step 6: Check Traefik Dashboard (Optional)

If you have the Traefik dashboard exposed (see
[Expose Traefik Dashboard](../../networking/expose-traefik-dashboard-inside-the-k3s-cluster)),
you can view your ingress routes there.

## Verification

Verify everything is working:

```bash
# Check ingress resources
kubectl get ingress -n practice-09

# Check endpoints (services have backends)
kubectl get endpoints -n practice-09

# Check pods are receiving traffic
kubectl logs -l app=website -n practice-09 --tail=5
kubectl logs -l app=api -n practice-09 --tail=5

# Test all routes
curl -H "Host: website.local" http://$TRAEFIK_IP
curl -H "Host: api.local" http://$TRAEFIK_IP
curl -H "Host: app.local" http://$TRAEFIK_IP/
curl -H "Host: app.local" http://$TRAEFIK_IP/api
```

## Understanding What Happened

- **Ingress Resource**: Defines routing rules (not the actual router)
- **Ingress Controller (Traefik)**: Reads Ingress resources and configures
  routing
- **Host-Based Routing**: Routes based on the `Host` header (domain name)
- **Path-Based Routing**: Routes based on the URL path
- **ClusterIP Services**: Ingress routes to ClusterIP services (no LoadBalancer
  needed per service)

## When to Use Each Pattern

| Pattern    | Use Case                              |
| ---------- | ------------------------------------- |
| Host-based | Multiple apps on different subdomains |
| Path-based | Single domain with API and frontend   |
| Combined   | Complex routing requirements          |

## Cleanup

Remove all resources:

```bash
kubectl delete namespace practice-09
```

Also clean up `/etc/hosts` entries if you added them:

```bash
# Edit /etc/hosts and remove the lines you added
sudo nano /etc/hosts
```

## Next Steps

→ [Exercise 10: Complete Application](./complete-application)

## Additional Practice

1. Create an Ingress with both host and path routing combined
2. Add a third service and route to it via a different path
3. Explore Traefik IngressRoute CRD for more advanced features:
   ```bash
   kubectl get ingressroutes -A
   ```
4. Check the Traefik documentation for middleware (authentication, rate
   limiting)
