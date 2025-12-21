---
title: K3S Backup
---

### **Part 1: Prerequisites , Cloudflare R2 Setup**

Before we touch the cluster, let's prepare our backup destination.

1.  **Create an R2 Bucket:**

    - In your Cloudflare dashboard, go to **R2** and click **Create bucket**.
    - Give it a unique name (e.g., `k3s-backup-repository`). Note this name.
    - Note your **S3 Endpoint URL** from the bucket's main page. It looks like: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

2.  **Create R2 API Credentials:**

    - On the main R2 page, click **Manage R2 API Tokens**.
    - Click **Create API Token**.
    - Give it a name (e.g., `k3s-backup-token`) and grant it **Object Read & Write** permissions.
    - Click **Create API Token** and securely copy the **Access Key ID** and the **Secret Access Key**.

You now have four critical pieces of information:

- Bucket Name
- S3 Endpoint URL
- Access Key ID
- Secret Access Key

### **Part 2: The Foundation , K3s Installation**

Install K3s on your server node. Using the default installation script is straightforward.

```bash
curl -sfL https://get.k3s.io | sh -
# Wait a moment for it to start
sudo k3s kubectl get nodes
```

### **Part 3: The Storage Layer , Longhorn Setup**

We will install Longhorn using Helm, the standard package manager for Kubernetes.

1.  **Add the Longhorn Helm Repository:**

    ```bash
    helm repo add longhorn https://charts.longhorn.io
    helm repo update
    ```

2.  **Install Longhorn:**

    ```bash
    helm install longhorn longhorn/longhorn \
      --namespace longhorn-system \
      --create-namespace \
      --set persistence.defaultClass=true
    ```

    - `persistence.defaultClass=true`: This is crucial. It makes Longhorn the default storage provider for any `PersistentVolumeClaim` (PVC).

3.  **Verify the Installation:**

    ```bash
    kubectl get pods -n longhorn-system --watch
    # Wait until all pods are Running. This can take several minutes.
    ```

4.  **Configure Longhorn's Native Backup (Secondary Protection):**

    - Access the Longhorn UI. You can do this via port-forwarding:
      ```bash
      kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
      ```
      Now open `http://localhost:8080` in your browser.
    - Navigate to **Settings \> Backup**.
    - Set the **Backup Target** to your R2 endpoint and bucket: `s3://<BUCKET_NAME>@<REGION>/<PATH>` (for R2, region can be `auto`). For example: `s3://k3s-backup-repository@auto/longhorn`
    - Create a Kubernetes secret containing your R2 credentials:
      ```bash
      kubectl create secret generic r2-longhorn-secret -n longhorn-system \
        --from-literal=AWS_ACCESS_KEY_ID='YOUR_R2_ACCESS_KEY_ID' \
        --from-literal=AWS_SECRET_ACCESS_KEY='YOUR_R2_SECRET_ACCESS_KEY'
      ```
    - Set the **Backup Target Credential Secret** in the Longhorn UI to `r2-longhorn-secret`.
    - Click **Save**.

### **Part 4: The Primary Backup Layer , Velero Setup**

This is the core of our application recovery strategy.

1.  **Create a Credentials File for Velero:**
    Create a file named `credentials-velero`:

    ```ini
    [default]
    aws_access_key_id = YOUR_R2_ACCESS_KEY_ID
    aws_secret_access_key = YOUR_R2_SECRET_ACCESS_KEY
    ```

2.  **Install Velero with Helm:**
    This command will install Velero and configure it to use R2 as the backup destination and enable the crucial CSI plugin for Longhorn snapshots.

    ```bash
    helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
    helm repo update

    helm install velero vmware-tanzu/velero \
      --namespace velero \
      --create-namespace \
      --set-file credentials.secretContents.cloud=credentials-velero \
      --set configuration.provider=aws \
      --set configuration.backupStorageLocation.name=default \
      --set configuration.backupStorageLocation.bucket=<YOUR_BUCKET_NAME> \
      --set configuration.backupStorageLocation.config.region=auto \
      --set configuration.backupStorageLocation.config.s3Url=<YOUR_S3_ENDPOINT_URL> \
      --set-string snapshotsEnabled=true \
      --set-string deployRestic=false \
      --set initContainers[0].name=velero-plugin-for-aws \
      --set initContainers[0].image=velero/velero-plugin-for-aws:v1.10.0 \
      --set initContainers[0].volumeMounts[0].mountPath=/target \
      --set initContainers[0].volumeMounts[0].name=plugins \
      --set initContainers[1].name=velero-plugin-for-csi \
      --set initContainers[1].image=velero/velero-plugin-for-csi:v0.6.2 \
      --set initContainers[1].volumeMounts[0].mountPath=/target \
      --set initContainers[1].volumeMounts[0].name=plugins
    ```

3.  **Verify the Velero Installation:**

    ```bash
    kubectl get pods -n velero --watch
    # Wait for the velero pod to be Running.
    ```

    You have now installed Velero and given it access to your R2 bucket.

### **Part 5: The Test , Break and Rebuild**

Now for the fun part. Let's prove the system works.

**Step 1: Deploy a Stateful Application**

Create a file `my-app.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: my-app-pod
spec:
  containers:
    - name: my-app
      image: busybox
      command: ["/bin/sh", "-c"]
      args:
        - while true; do
          echo "$(date)" >> /data/test.log;
          sleep 5;
          done
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: my-app-pvc
```

Deploy it:

```bash
kubectl apply -f my-app.yaml
```

**Step 2: Create a Backup with Velero**

```bash
velero backup create my-first-backup --include-namespaces default
```

This command tells Velero to back up all resources in the `default` namespace. Because you enabled the CSI plugin, Velero automatically finds the PVC and triggers Longhorn to create a volume snapshot, which is then backed up alongside the Pod and PVC definitions.

**Step 3: The Disaster , Destroy the Cluster**

Let's simulate a total cluster failure. We will completely remove K3s.

```bash
# First, delete the application to simulate data loss
kubectl delete -f my-app.yaml

# Now, obliterate the cluster
/usr/local/bin/k3s-uninstall.sh
```

Your cluster is now gone. All that remains is your R2 bucket.

**Step 4: The Recovery , Rebuild and Restore**

1.  **Re-install a Clean K3s Cluster:**

    ```bash
    curl -sfL https://get.k3s.io | sh -
    sudo k3s kubectl get nodes
    ```

2.  **Re-install Longhorn:** You must have the storage provider available before you can restore data to it.

    ```bash
    helm repo add longhorn https://charts.longhorn.io
    helm repo update
    helm install longhorn longhorn/longhorn --namespace longhorn-system --create-namespace --set persistence.defaultClass=true
    # Wait for Longhorn pods to be running
    kubectl get pods -n longhorn-system --watch
    ```

3.  **Re-install Velero with the EXACT same configuration:** Run the same Helm install command from Part 4 again. This is critical, as it reconnects Velero to your R2 bucket where the backups live.

4.  **Verify Velero Sees Your Backup:**

    ```bash
    # It may take a minute for Velero to sync.
    velero backup get
    # You should see 'my-first-backup' in the list!
    ```

5.  **Restore Everything:**

    ```bash
    velero restore create --from-backup my-first-backup
    ```

6.  **Verify the Restore:**

    ```bash
    kubectl get pods --watch
    # You will see 'my-app-pod' get created.

    # Check the data that was restored
    kubectl exec my-app-pod -- cat /data/test.log
    ```

You will see the log file with the timestamps from before you destroyed the cluster. You have successfully recovered your application and its persistent state from nothing but a backup file in Cloudflare R2.
