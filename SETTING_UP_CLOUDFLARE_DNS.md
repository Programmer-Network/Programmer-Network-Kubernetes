To dynamically create a DNS record (such as a CNAME or A record) in Cloudflare when provisioning an API in a Kubernetes (K3s) cluster, you can use **ExternalDNS** along with Cloudflare's API. ExternalDNS is a tool designed to manage DNS records dynamically for Kubernetes resources like services and ingresses.

### Setup Overview
1. **Install ExternalDNS**: Configure ExternalDNS in your K3s cluster to watch for services or ingress resources and create/update DNS records in Cloudflare.
2. **Configure Cloudflare API Access**: Provide the necessary permissions and API tokens to ExternalDNS to interact with Cloudflare’s DNS.
3. **Create Kubernetes Resources**: Set up your API service/ingress with annotations that ExternalDNS will detect to create the necessary DNS records.

### Step 1: Configure Cloudflare API Token
Create an API Token in Cloudflare with permissions to manage DNS records:
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Create a custom token with permissions:
   - Zone → DNS → Edit
   - Zone → Zone → Read
3. Copy the generated API token for later use.

### Step 2: Install ExternalDNS in Your K3s Cluster
You can deploy ExternalDNS with Helm or using a Kubernetes YAML manifest.

#### Using Helm:
If you have Helm installed, you can deploy ExternalDNS like this:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install externaldns bitnami/external-dns \
  --set provider=cloudflare \
  --set cloudflare.apiToken="YOUR_CLOUDFLARE_API_TOKEN" \
  --set txtOwnerId="my-k3s-cluster" \
  --set policy=sync \
  --set source=service
```

Replace `YOUR_CLOUDFLARE_API_TOKEN` with your actual API token from Cloudflare.

#### Using a YAML Manifest:
If you prefer, you can use a YAML configuration file. Here’s a basic example for deploying ExternalDNS:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-dns
  namespace: default

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: external-dns
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: external-dns
  template:
    metadata:
      labels:
        app: external-dns
    spec:
      serviceAccountName: external-dns
      containers:
        - name: external-dns
          image: registry.k8s.io/external-dns/external-dns:v0.12.2
          args:
            - --source=service
            - --provider=cloudflare
            - --cloudflare-proxied
            - --cloudflare-api-token=YOUR_CLOUDFLARE_API_TOKEN
            - --txt-owner-id=my-k3s-cluster
          env:
            - name: CF_API_TOKEN
              value: "YOUR_CLOUDFLARE_API_TOKEN"
```

Replace `YOUR_CLOUDFLARE_API_TOKEN` with the Cloudflare API token you created earlier.

### Step 3: Annotate Services or Ingresses
To automatically create a DNS record for your API when provisioning, annotate the Kubernetes Service or Ingress resource. For example, to create a CNAME record for a Service, you might define the following YAML:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-api-service
  annotations:
    external-dns.alpha.kubernetes.io/hostname: "api.example.com" # Replace with your desired hostname
spec:
  selector:
    app: my-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```

### Step 4: Verify the DNS Record Creation
ExternalDNS will detect the annotated service or ingress and automatically create a DNS record in Cloudflare using the specified hostname. You can check Cloudflare’s dashboard or use a DNS lookup tool to verify the new DNS entry.

This setup will dynamically manage DNS records in Cloudflare, creating and updating them based on changes in your Kubernetes cluster.