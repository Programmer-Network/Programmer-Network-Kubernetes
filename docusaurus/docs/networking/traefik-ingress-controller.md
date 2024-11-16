---
title: Traefik Ingress Controller
---

As we have learned in the previous section ([Kubernetes Networking](understanding-network-components#ingress-controllers-traefik-nginx)), ingress controllers are responsible for managing HTTP and HTTPS traffic, enabling external access to internal Kubernetes services. In simpler terms, the ingress controller ensures that incoming traffic is directed to the appropriate services that we define.

In K3s, [Traefik](https://doc.traefik.io/traefik/) comes preconfigured as the default ingress controller, which means we can also take advantage of the [Traefik Dashboard](https://doc.traefik.io/traefik/operations/dashboard/). However, since the dashboard is not fully set up by default, we will need to configure it ourselves.

Let's proceed with setting that up.

### Verify Traefik is Running

First, let’s check if Traefik is installed and running in the cluster:
```bash
kubectl get pods -n kube-system
```

We’ll look for a pod with a name like `traefik-...`. If it’s there and running, we’re good to go. If not, we might need to revisit the K3s installation settings.

### Enable the Traefik Dashboard

By default, the dashboard might not be set up, so we can create an `IngressRoute` for it.

Let’s start by creating a YAML file with the following configuration:

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: traefik-dashboard
  namespace: kube-system
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`traefik.localhost`)
      kind: Rule
      services:
        - name: api@internal
          kind: TraefikService
```

Then, we’ll apply it:
```bash
kubectl apply -f traefik-dashboard.yaml
```

### Expose the Dashboard

To make the dashboard accessible, we need the hostname `traefik.localhost` to resolve to our cluster. 

One way to do this is by adding an entry to our local `/etc/hosts` file:

```plaintext
127.0.0.1 traefik.localhost
```

If our cluster isn’t running locally, we’ll replace `127.0.0.1` with the IP address of our K3s server.

Alternatively, we could expose Traefik via a `NodePort` service or a load balancer if needed.

### Access the Dashboard

Now, we can visit the dashboard in our browser at:
```
http://traefik.localhost
```

### Secure the Dashboard (Optional)

If this is in a shared environment, we might want to secure the dashboard with basic authentication. This can be done using a `Middleware` resource in Traefik.

