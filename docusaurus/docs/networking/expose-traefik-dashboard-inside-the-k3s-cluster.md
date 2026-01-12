---
title: Expose Traefik Dashboard inside the K3s Cluster
---

As we have learned in the previous section
([Kubernetes Networking](understanding-network-components#ingress-controllers-traefik-nginx)),
ingress controllers are responsible for managing HTTP and HTTPS traffic,
enabling external access to internal Kubernetes services. In simpler terms, the
ingress controller ensures that incoming traffic is directed to the appropriate
services that we define.

In K3s, [Traefik](https://doc.traefik.io/traefik/) comes preconfigured as the
default ingress controller, which means we can also take advantage of the
[Traefik Dashboard](https://doc.traefik.io/traefik/operations/dashboard/).
However, since the dashboard is not fully set up by default, we will need to
configure it ourselves.

Let's proceed with setting that up.

### Verify Traefik is Running

First, let’s check if Traefik is installed and running in the cluster:

```bash
kubectl get pods -n kube-system
```

We’ll look for a pod with a name like `traefik-...`. If it’s there and running,
we’re good to go. If not, we might need to revisit the K3s installation
settings.

## Objective

You will be creating the required Kubernetes resources:

1. A `ClusterIP` service to expose the Traefik dashboard.
2. An `Ingress` rule to route traffic to the dashboard service.

## Create the Traefik Dashboard Service

We'll create a `ClusterIP` Service to expose the Traefik dashboard. This service
will make the Traefik dashboard's HTTP API, running on port `9000`, available to
the cluster.

Create a YAML file named `traefik-dashboard-service.yaml` with the following
contents:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: traefik-dashboard
  namespace: kube-system
  labels:
    app.kubernetes.io/instance: traefik
    app.kubernetes.io/name: traefik-dashboard
spec:
  type: ClusterIP
  ports:
    - name: traefik
      port: 9000 # Dashboard listens on port 9000
      targetPort: 9000 # Forward traffic to this port on Traefik pods
      protocol: TCP
  selector:
    app.kubernetes.io/instance: traefik-kube-system
    app.kubernetes.io/name: traefik
```

- **Explanation**:
  - `ClusterIP`: Used for internal access only (within the cluster not
    externally exposed).

  - The service exposes port `9000`, which is the default port where Traefik
    serves its dashboard.

```bash
kubectl apply -f traefik-dashboard-service.yaml
```

---

## Create the Traefik Ingress Resource

Next, we need to create an Ingress that routes traffic to the
`traefik-dashboard` service created in the previous step. This will allow
external traffic to reach the dashboard by using a specific domain.

Create a YAML file named `traefik-dashboard-ingress.yaml` with the following
contents:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: traefik-ingress
  namespace: kube-system
  annotations:
    spec.ingressClassName: traefik
spec:
  rules:
    - host: YOUR_DOMAIN_NAME # Replace YOUR_DOMAIN_NAME with your own domain.
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: traefik-dashboard
                port:
                  number: 9000
```

- Ingress: The ingress resource defines rules that route HTTP requests to
  `traefik-dashboard` at port `9000` based on a specific host
  (`YOUR_DOMAIN_NAME`).

- Replace `YOUR_DOMAIN_NAME` with the desired domain name where you want to
  expose your Traefik dashboard.

- IngressClass: We're using the `traefik` ingress controller, as it's the
  default installed ingress controller for K3s.

```bash
kubectl apply -f traefik-dashboard-ingress.yaml
```

---

## Update DNS or `/etc/hosts`

To access the Traefik dashboard through your web browser, you'll need to ensure
DNS resolves the host (`YOUR_DOMAIN_NAME`) to the correct IP address (either a
load balancer IP, node IP, etc.). In the case of local development, you can
update your **/etc/hosts** file.

Suppose you're running a single-node K3s cluster accessible at the IP
`192.168.1.100` and you want to use `traefik.example.com`.

Edit `/etc/hosts` and add:

```bash
192.168.1.100 traefik.example.com
```

## Access the Traefik Dashboard

Once the service and ingress resources are in place, and DNS (or `/etc/hosts`)
has been configured, you should be able to access the dashboard in your browser:

```
http://traefik.example.com/
```

### Notes:

- Deployment Security: The `Ingress` config above exposes the dashboard without
  authentication. For production deployments, consider securing the dashboard
  with basic authentication or other mechanisms.
- Dashboard Availability: By default, Traefik's dashboard is available via port
  9000 and isn't exposed unless configured to be so. The steps above ensure it
  is properly exposed.

## Clean-up

When you no longer need the Traefik Dashboard exposed, you can remove the
resources by using the following commands:

```bash
kubectl delete -f traefik-dashboard-ingress.yaml
kubectl delete -f traefik-dashboard-service.yaml
```
