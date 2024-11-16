### Install the CloudNativePG Operator

**Create the [CloudNativePG](https://cloudnative-pg.io) Namespace**
First, create a namespace for CloudNativePG. You don't have to do this, but it's good practice to separate operators into their own namespaces.

```bash
kubectl create namespace cnpg-system
```

**Install the [CloudNativePG](https://cloudnative-pg.io) Operator using kubectl**

The CloudNativePG team provides a manifest file that’s hosted publicly. You can fetch it using `kubectl` directly from their GitHub repository and apply it to your cluster.

```bash
# Take the latest version from: https://cloudnative-pg.io/documentation/current/installation_upgrade/

kubectl apply --server-side -f \
  https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.1.yaml
```

This command applies all necessary resources such as CRDs, RBAC permissions, and the operator's Deployment.

**Verify the Deployment**

You can check if the CloudNativePG operator pod is running correctly in its namespace:

```bash
kubectl get pods -n cnpg-system
```

You should see output like this:

```bash
NAME                                READY   STATUS    RESTARTS   AGE
cloudnative-pg-controller-manager   1/1     Running   0          1m
```

At this point, the CloudNativePG operator is installed, and you’re ready to create PostgreSQL clusters.


### Deploy a PostgreSQL Cluster

Now that CloudNativePG is running, let's set up a simple PostgreSQL database cluster.

**Create a Namespace for Your PostgreSQL Database**

For better organization, create a namespace for your PostgreSQL cluster if needed:

```bash
kubectl create namespace postgres-db
```

**Create a PostgreSQL Cluster YAML Definition**

Save the following YAML into a file called `postgres-cluster.yaml`:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
    name: my-postgres-cluster
    namespace: postgres-db
spec:
    instances: 3                         # Number of database instances
    primaryUpdateMethod: switchover       # Update strategy for the primary node
    storage:
    size: 1Gi                          # Storage size for persistent volumes
    storageClass: longhorn
```

This YAML creates a PostgreSQL cluster with 3 instances managed by CloudNativePG. Note the `storageClass` is set to `longhorn`, assuming you have Longhorn installed and set up as the default backend. You might want to adjust the `size` value of the storage (`1Gi`) if needed.

3 replicas of PostgreSQL pods will be created, providing High Availability.

**Apply the PostgreSQL Cluster YAML**

Run the following command to deploy the PostgreSQL cluster to your Kubernetes cluster:

```bash
kubectl apply -f postgres-cluster.yaml
```

**Verify Running PostgreSQL Pods**

After creating the cluster, confirm that the pods for your PostgreSQL cluster are created and running:

```bash
kubectl get pods -n postgres-db
```

You should see something like:

```bash
NAME                                 READY   STATUS    RESTARTS   AGE
my-postgres-cluster-1                1/1     Running   0          1m
my-postgres-cluster-2                1/1     Running   0          1m
my-postgres-cluster-3                1/1     Running   0          1m
```

**Access PostgreSQL**

To access PostgreSQL, you’ll want to port-forward from your local machine to one of the PostgreSQL pods. Run the following command:

```bash
kubectl port-forward svc/my-postgres-cluster 5432:5432 -n postgres-db
```

Then, on your machine, you can connect to PostgreSQL at `localhost:5432` using any PostgreSQL client or `psql`.

For example:

```bash
psql -h localhost -U postgres
```

By default, the `postgres` user is created, and you can set custom credentials by defining them in the cluster YAML under `spec.users`.


### Optional: Persistent Volumes with Longhorn

To ensure the PostgreSQL data persists across node restarts, Kubernetes Persistent Volume Claims (PVCs) should use a proper storage class. 

We assumed in the YAML above that you've configured Longhorn as your storage solution:

```yaml
storageClass: longhorn
```

This makes use of Longhorn's reliable storage and ensures that your PostgreSQL data is replicated and safe from node failures.