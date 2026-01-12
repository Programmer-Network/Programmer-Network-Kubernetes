---
title: Expose Longhorn Dashboard using Traefik Ingress
---

### Identify the Longhorn Dashboard Service

When Longhorn is installed, it comes with a **Service** called
`longhorn-frontend`. This service manages access to the Longhorn dashboard,
which is used for monitoring and managing Longhorn volumes.

You can verify the service by running:

```bash
kubectl get svc -n longhorn-system
```

Look for the **`longhorn-frontend`** service in the output, which typically
looks like this:

```plaintext
NAME                TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
longhorn-frontend   ClusterIP   10.43.75.105   <none>        80/TCP    4m
```

### Create an Ingress Resource to Expose the Dashboard

We will use **Traefik Ingress** to expose the Longhorn dashboard so that it is
accessible via a browser.

#### Ingress YAML Configuration

Create a YAML file (e.g., `longhorn-ingress.yaml`) with the following
configuration:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: longhorn-ingress
  namespace: longhorn-system
spec:
  ingressClassName: traefik # We use Traefik as the ingress controller
  rules:
    - host: longhorn.local.host # The domain by which we'll access Longhorn UI
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: longhorn-frontend # Service managing Longhorn dashboard
                port:
                  number: 80 # Service port where Longhorn UI runs
```

This configuration does the following:

- It tells Traefik to expose the **`longhorn-frontend`** service (which runs the
  dashboard) under the host `longhorn.local.host`.

- HTTP traffic to this host will be routed to the Longhorn dashboard running on
  port 80.

#### Apply the Ingress Resource:

After creating the YAML file, apply it to your cluster:

```bash
kubectl apply -f longhorn-ingress.yaml
```

### Configure Your `/etc/hosts` File for Local Access

Since this is for local testing, we need to map the domain `longhorn.local.host`
to the IP address of your Kubernetes cluster. We'll achieve this by updating
your **`/etc/hosts`** file to resolve requests for `longhorn.local.host` to your
cluster node's IP.

#### Get the Cluster Node's IP:

Find the IP address of your cluster node (where Traefik or your load balancer is
running). You can often use `kubectl get nodes -o wide` to retrieve the IP
address. It might look something like this:

```bash
kubectl get nodes -o wide
```

```plaintext
NAME          STATUS   ROLES                 AGE   VERSION   INTERNAL-IP     EXTERNAL-IP     OS-IMAGE             KERNEL-VERSION   CONTAINER-RUNTIME
node-master   Ready    master,control-plane   12d   v1.22.2   192.168.1.100   <none>          Ubuntu 20.04.3 LTS   5.4.0-89-generic   docker://20.10.8
node-worker   Ready    worker                11d   v1.22.2   192.168.1.101   <none>          Ubuntu 20.04.3 LTS   5.4.0-89-generic   docker://20.10.8
```

In this example, suppose Traefik is running on the master node, which has the IP
`192.168.1.100`.

#### Update `/etc/hosts`:

Edit the `/etc/hosts` file on your local machine using a text editor (e.g.,
`vim`, `nano`, etc.).

```bash
sudo nano /etc/hosts
```

Add the following entry, replacing **`192.168.1.100`** with your node's IP:

```plaintext
192.168.1.100 longhorn.local.host
```

This entry ensures that when you open `http://longhorn.local.host` in your
browser, it will route the traffic to your cluster.

### Access the Longhorn Dashboard

Now that your ingress is configured and your `/etc/hosts` is updated, you should
be able to access the Longhorn dashboard by navigating to:

```
http://longhorn.local.host
```

The Longhorn UI should load in your browser, allowing you to manage your
Longhorn volumes and nodes.
