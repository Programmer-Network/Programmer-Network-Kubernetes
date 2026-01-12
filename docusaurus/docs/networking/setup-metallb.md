---
title: Setting up Metallb
---

To disable the default Service Load Balancer (ServiceLB) in a running K3s
cluster, you can modify the K3s configuration to prevent it from automatically
deploying the ServiceLB controller. This is necessary if you're installing a
custom load balancer like MetalLB.

Here are the steps to disable the ServiceLB in K3s:

### 1. Edit the K3s Server Config

You need to modify the K3s configuration to disable ServiceLB. To do this, you
can either modify the `k3s.service` file (on systems using `systemd`) or provide
the `--disable servicelb` flag when starting the K3s server binary.

#### Option 1: Update the K3s systemd service

1. Find the systemd service file for K3s. Typically, on a Linux system, it's
   located at `/etc/systemd/system/k3s.service`. You can confirm with:

```sh
systemctl status k3s
```

2. Edit the service file:

```sh
sudo nano /etc/systemd/system/k3s.service
```

3. Add the following option to the `ExecStart` line to disable the built-in
   ServiceLB:

```sh
--disable servicelb
```

The modified `ExecStart` should look something like this:

```sh
ExecStart=/usr/local/bin/k3s \
    server \
--disable servicelb
```

4. Reload the `systemd` daemon, and restart K3s to apply the changes:

```sh
sudo systemctl daemon-reload
sudo systemctl restart k3s
```

#### Option 2: Edit `/etc/rancher/k3s/config.yaml` (Preferred for Persistent Changes)

Alternatively, if you're using the K3s configuration file for persistent
configuration, you can add the `--disable servicelb` flag into the
`/etc/rancher/k3s/config.yaml` file:

1. Edit the config file:

```sh
sudo nano /etc/rancher/k3s/config.yaml
```

2. Add the following entry:

```yaml
disable:
  - servicelb
```

3. Save the file and restart K3s:

```sh
sudo systemctl restart k3s
```

### 2. Remove Existing ServiceLB

Once you've disabled the ServiceLB in your configuration and restarted K3s, you
may also want to clean up any lingering instances of the ServiceLB already
running.

To do that, run the following command to remove the existing `svc/traefik`
(default ServiceLB component) and `SvcLB` resources, if present:

```sh
kubectl delete daemonset -n kube-system svclb-traefik
kubectl delete deployments -n kube-system traefik
```

Note: The resource name for the default load balancer may vary depending on your
K3s setup, so check with the following command to get the precise resource
names:

```sh
kubectl get daemonsets -A
```

### 3. Install MetalLB

Now that ServiceLB is disabled, you can safely install and configure MetalLB in
your cluster.

You can follow the official MetalLB documentation to deploy and configure it:

```sh
# Check the latest version at: https://metallb.universe.tf/installation/
# Example for version 0.14.x:

kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.5/config/manifests/metallb-native.yaml
```

Wait for MetalLB pods to be running:

```bash
kubectl get pods -n metallb-system --watch
```

Afterward, make sure to configure an `IPAddressPool` and `L2Advertisement` to
activate MetalLB for handling load balancer services (see Step 1 and Step 2
below).

### MetalLB with Traefik Ingress Controller

In order to make **MetalLB** work with your **Traefik Ingress Controller** in a
K3s cluster, you'll need to configure both components to properly handle
`LoadBalancer` services for external traffic routing. Below is a step-by-step
guide on how to do this:

### Prerequisites:

- K3s is running, and you’ve already disabled the default K3s **ServiceLB** as
  mentioned (with `--disable servicelb`).

### Step 1: Configure MetalLB IP Address Pool

1. **Identify an IP Range** that you want MetalLB to use for allocating external
   IP addresses. The IPs should come from a range within your local network that
   is not already in use by other devices. For example, you could designate a
   range like `192.168.1.240-192.168.1.250`.

2. **Create the IPAddressPool** resource in Kubernetes, so that MetalLB knows
   what IP addresses to manage.

Create a YAML file (e.g., `ip-address-pool.yaml`) that defines the
`IPAddressPool`:

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-address-pool
  namespace: metallb-system
spec:
  addresses:
    - 192.168.1.240-192.168.1.250 # Example IP range, adjust to your network's range
  autoAssign: true
  avoidBuggyIPs: true
```

Apply the IP address pool:

```sh
kubectl apply -f ip-address-pool.yaml
```

### Step 2: Configure L2Advertisement

The `L2Advertisement` resource tells MetalLB to advertise the IPs at Layer 2
level (ARP/ND). You can create a simple advertisement or configure it with node
selectors and specific interfaces for more control.

#### Basic L2Advertisement

For a simple setup where all nodes can advertise IPs:

```yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default-advertisement
  namespace: metallb-system
spec:
  ipAddressPools:
    - default-address-pool
```

#### Advanced L2Advertisement with Node Selectors

If you have different node types (e.g., mini PCs and Raspberry Pis) with
different network interfaces, you can create separate advertisements:

```yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: minipc-advertisement
  namespace: metallb-system
spec:
  ipAddressPools:
    - default-address-pool
  nodeSelectors:
    - matchLabels:
        nodetype: minipc
  interfaces:
    - eno1 # Specify the network interface for mini PCs

---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: pi-advertisement
  namespace: metallb-system
spec:
  ipAddressPools:
    - default-address-pool
  nodeSelectors:
    - matchLabels:
        nodetype: pi
  interfaces:
    - eth0 # Specify the network interface for Raspberry Pis
```

**Important**: Make sure your nodes have the appropriate labels (e.g.,
`nodetype: minipc` or `nodetype: pi`) for node selectors to work.

Apply the L2Advertisement configuration:

```sh
kubectl apply -f l2-advertisement.yaml
```

Make sure the assigned IP range is not being used by other devices on your local
network, or you may run into IP conflicts.

### Step 3: Update Traefik Service to Use `LoadBalancer` Type

By default, Traefik may expose itself as a `ClusterIP` or a `NodePort` in some
K3s setups. However, to leverage MetalLB for external access, you need to modify
the Traefik service to be of type `LoadBalancer` so it can acquire an external
IP.

1. **Edit the Traefik Service**:

You can modify the Traefik Service directly or update its Helm chart (if you
used Helm for installation).

If Traefik was installed as part of the K3s default installation, you can edit
the `traefik` service directly:

```sh
kubectl edit svc -n kube-system traefik
```

Look for the `type` field under the `spec` section in the service YAML
definition and change it to `LoadBalancer`:

```yaml
spec:
  type: LoadBalancer
```

Your service update might look like:

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/instance: traefik
    app.kubernetes.io/name: traefik
  name: traefik
  namespace: kube-system
spec:
  externalTrafficPolicy: Cluster
  ports:
    - name: web
      port: 80
      protocol: TCP
      targetPort: 80
    - name: websecure
      port: 443
      protocol: TCP
      targetPort: 443
  selector:
    app.kubernetes.io/instance: traefik
    app.kubernetes.io/name: traefik
  type: LoadBalancer
```

2. **Save and Exit** the editor.

### Step 4: Confirm Traefik Is Assigned a LoadBalancer IP From MetalLB

After modifying Traefik’s service type to `LoadBalancer`, you need to check if
MetalLB has assigned an external IP from the specified range. To do this, run
the following command:

```sh
kubectl get svc -n kube-system traefik
```

You should see something similar to:

```bash
NAME      TYPE           CLUSTER-IP      EXTERNAL-IP        PORT(S)                      AGE
traefik   LoadBalancer   10.43.123.45    192.168.1.240      80:31112/TCP,443:31777/TCP    12m
```

- `EXTERNAL-IP` should have a value from the IP pool you configured (e.g.,
  `192.168.1.240`).

- If the `EXTERNAL-IP` shows as `<pending>`, double-check that MetalLB has the
  correct IP pool configuration and that the nodes/pods can reach the network
  you specified.

---

### Step 5: (Optional) Verify Traefik Ingress Functionality

Test the Traefik ingress controller by creating an `Ingress` resource, which
should be exposed externally via the LoadBalancer IP that MetalLB assigned.

1. Create a simple test ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
  namespace: default
spec:
  rules:
    - host: your.custom.domain # Or use an IP-based access
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: your-app-service # Replace this with a service that your app is running on
                port:
                  number: 80
```

2. Apply the `Ingress` resource:

```sh
kubectl apply -f test-ingress.yaml
```

3. Ensure your `DNS` points `your.custom.domain` to the external IP (or access
   it with the IP address directly).

4. You should be able to access your Traefik-ingressed service by navigating to
   `http://your.custom.domain` or `http://<external-IP>` in a browser.

---

### Additional Considerations:

- **DNS**: Ensure you have your DNS properly configured to point the hostname
  you use in your Ingress definition to the external IP provided by MetalLB.
- **SSL/TLS**: If you plan to use `HTTPS`, you'll want to configure SSL
  termination on Traefik. This typically involves configuring Traefik with
  either self-signed certificates, **ACME Let's Encrypt**, or another
  certificate management setup.
- **Firewall**: Make sure your network firewall policies (if any) allow access
  to external clients for the allocated IP range in your MetalLB configuration.

---

### Troubleshooting:

1. **No External IP**:
   - Make sure that MetalLB is configured correctly, and the IP range is valid
     in your local network.
   - Verify that the MetalLB controller and speaker pods are running.

   ```bash
   kubectl get pods -n metallb-system
   ```

   Check the logs of the MetalLB pods if you suspect issues:

   ```bash
   kubectl logs -n metallb-system speaker-xxxxxxxxxxx
   ```

2. **Invalid IP Range**:
   - Double-check that the IP range you’ve reserved for MetalLB does not overlap
     with a DHCP-pool range or any IP address that’s already in use on your
     local network.

3. **Ingress Routing Issues**:
   - Verify the `Ingress` resource, and ensure that the service names and ports
     match correctly with your application.
   - Validate Traefik's logs for any issues related to routing.
