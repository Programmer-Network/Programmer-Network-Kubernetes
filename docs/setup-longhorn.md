#### 1. Download the Longhorn Manifest YAMLs

Longhorn's manifest files are available in their GitHub repository. You can apply them directly to the Kubernetes cluster:

```bash
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/master/deploy/longhorn.yaml
```

This command will pull the entire Longhorn deployment YAML, which configures everything Longhorn requires inside the `longhorn-system` namespace.

#### 2. Monitor the Deployment Progress

After applying the manifest, you'll see various Kubernetes objects like Pods, Services, DaemonSets, and CRDs being created. You can monitor them with the following command:

```bash
kubectl get all -n longhorn-system
```

Especially watch the status of the Pods.

It will take a couple of minutes for all required components to pull the images from the Docker registry, configure themselves, and become ready.

#### 3. Verify Custom Resource Definitions (CRDs)

Longhorn uses Custom Resource Definitions (CRDs) for managing and storing information about volumes, nodes, and engines.

Check if the Longhorn CRDs have been installed properly:

```bash
kubectl get crds | grep longhorn
```

You should see a list of Longhorn-related CRDs like:

- `instancemanagers.longhorn.io`
- `volumes.longhorn.io`
- `nodes.longhorn.io`
- `replicas.longhorn.io`
- and others.

These CRDs are the foundation of Longhorn's integration into your Kubernetes cluster.

#### 4. Verify Longhorn Components (Pods, DaemonSet)

Ensure that all Longhorn components are running (Pods and DaemonSet) using:

```bash
kubectl get pods -n longhorn-system
```

You should see Longhorn pods running, like:

- `longhorn-manager-{pod-name}`
- `longhorn-instance-manager-{pod-name}`
- `longhorn-ui-{pod-name}`
- `longhorn-driver-deployer-{pod-name}`

Additionally, verify that the `longhorn-manager` DaemonSet has pods on **every node** in your cluster, as it’s responsible for managing Longhorn processes on each node:

```bash
kubectl get ds -n longhorn-system
```

Check that the DaemonSet has `Desired` pods on all your nodes, and `Current` matches the desired pod count.

### Step 2: Accessing the Longhorn UI

Longhorn provides a web-based UI for managing your storage. To access it, you will need to expose its service.

#### 1. Port Forwarding for Local UI Access

You can use `kubectl port-forward` to access the Longhorn UI on localhost:

```bash
kubectl -n longhorn-system port-forward svc/longhorn-frontend 8080:80
```

Then navigate to `http://localhost:8080` in your browser to see the Longhorn web UI.

#### 2. Expose the Service with NodePort (Optional)

Alternatively, you may expose the UI service at the `NodePort` or use `Ingress` for more convenient access from a browser on your local network.

Here’s how you can switch the service to `NodePort`:

```yaml
kubectl patch svc longhorn-frontend \
  -n longhorn-system \
  -p '{"spec": {"type": "NodePort"}}'
```

Now, inspect the service to view the assigned external port:

```bash
kubectl get svc longhorn-frontend -n longhorn-system
```

You'll see something like this:

```
NAME              TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
longhorn-frontend NodePort   10.43.31.44   <none>        80:32009/TCP   30m
```

You can now access Longhorn UI by visiting `http://<node-ip>:32009` from any device on the network.

### Step 3: Configure Nodes for Longhorn Storage

Longhorn automatically recognizes your Kubernetes nodes, but you may want to configure how disks on your nodes are used for storage.

You can do this through the **Longhorn UI** under the **Node & Disk** section. Here you can:

- Determine how much space is allocated on each node.
- Specify custom directories for disk storage (e.g., `/mnt/disk` instead of default paths).
- Set replication factors (i.e., how many copies of a volume will be stored across nodes).

### Step 4: Test Longhorn - Creating a PVC

Let’s verify that Longhorn is working by creating a test Persistent Volume Claim (PVC). Here’s how you can create a StorageClass and a sample PVC.

#### 1. Create the Longhorn StorageClass

To create a `StorageClass` for Longhorn, you need to define one so that Longhorn can dynamically provision volumes. You can use the default settings, but feel free to customize, especially the number of replicas depending on how many nodes you have.

Create a file named `longhorn-storageclass.yaml`:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn
provisioner: driver.longhorn.io
parameters:
  numberOfReplicas: "2"
  staleReplicaTimeout: "30"
allowVolumeExpansion: true
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

Then apply this StorageClass:

```bash
kubectl apply -f longhorn-storageclass.yaml
```

#### 2. Create a PVC Using Longhorn

Now create a sample Persistent Volume Claim (PVC) to test that Longhorn can provision volumes:

Create a `longhorn-pvc.yaml` file:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: longhorn-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 2Gi
```

Apply the PVC:

```bash
kubectl apply -f longhorn-pvc.yaml
```

Check the status of the PVC:

```bash
kubectl get pvc
```

Once it’s `Bound`, you know Longhorn successfully provisioned your storage.

#### 3. Optionally Deploy a Pod Using the PVC

To further verify the PVC is working, you can deploy a simple pod (for example, the NGINX web server) that mounts the Longhorn volume:

Create a simple `nginx-pod.yaml` file:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - image: nginx
    name: nginx
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: longhorn-pvc
```

Apply the pod:

```bash
kubectl apply -f nginx-pod.yaml
```

Once the pod is running, Longhorn storage is working as expected.

### Step 5: Monitor Longhorn

Longhorn offers monitoring and management tools (both in the UI and via the CLI) to track the status of volumes, nodes, and replicas.

Key areas to check:
- **Volumes**: Make sure volumes are healthy and properly replicated.
- **Replicas**: Ensure replicas are collaborating across your cluster nodes to ensure data redundancy.

### Conclusion

By now, you have installed Longhorn **without Helm**, manually applying the Kubernetes manifests, and have successfully configured and tested Longhorn on your Raspberry Pi 4 cluster with K3s.

This method ensures you get hands-on with the complete Kubernetes-native approach, and you can now tune and control Longhorn within your K8s environment — **no package manager necessary**.

Let me know if you need further assistance or have any questions!