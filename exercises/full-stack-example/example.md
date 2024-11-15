Great! Now that your K3s cluster is running with **MetalLB**, **Longhorn**, and the **Native PostgreSQL Operator**, you're ready to provision a full application stack that demonstrates:

1. **Node.js API** deployment.
2. Node.js API connects to **PostgreSQL** running as a cluster service.
3. **Persistent Storage** allocated using **PVCs (Persistent Volume Claims)** from Longhorn.
4. **LoadBalancer access** for the Node.js API service via MetalLB.

Let’s go step-by-step to set up a **Node.js API** that connects to a PostgreSQL database and uses Longhorn for storage.

---

### Prerequisite: Ensure PostgreSQL Is Working with a `ClusterIP` Service

You likely already have a **ClusterIP Service** for PostgreSQL through your native PostgreSQL Operator, so make sure you take note of:

1. PostgreSQL **ClusterIP** address.
2. PostgreSQL **service name**.
3. **Database credentials** (user, password, database name).

Let’s assume the following values (replace them with actual details from your setup):
- Postgres Service Name: `pg-cluster`
- Postgres Database Name: `mydb`
- Postgres User: `postgres`
- Postgres Password: `password123`
- Postgres Service Port: `5432`

---

### Step 1: Create Persistent Volume Claim (PVC) for Node.js API (Longhorn)

First, create a **PersistentVolumeClaim** (PVC) for the Node.js API to store any configuration, logs, or data it needs. This PVC will be backed by **Longhorn**.

1. Create a file named `nodejs-api-pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: nodejs-api-pvc
spec:
    accessModes:
    - ReadWriteOnce
    resources:
    requests:
        storage: 1Gi
    storageClassName: longhorn
```

2. Apply the PVC:

```bash
kubectl apply -f nodejs-api-pvc.yaml
```

This will allocate 1Gi of persistent storage from Longhorn for your Node.js API.

---

### Step 2: Create a ConfigMap for the Node.js Environment Variables

Your Node.js API will need environment variables to connect to PostgreSQL, so let’s create a **ConfigMap** for that.

1. Create a file named `nodejs-api-configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: nodejs-api-configmap
data:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password123
    POSTGRES_DB: mydb
    POSTGRES_HOST: pg-cluster
    POSTGRES_PORT: "5432"
```

You can modify the values to match your PostgreSQL service details.

2. Apply the ConfigMap:

```bash
kubectl apply -f nodejs-api-configmap.yaml
```

---

### Step 3: Create a Deployment for the Node.js API with the PVC and ConfigMap

1. Create a file named `nodejs-api-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: nodejs-api
spec:
    replicas: 1
    selector:
    matchLabels:
        app: nodejs-api
    template:
    metadata:
        labels:
        app: nodejs-api
    spec:
        containers:
        - name: nodejs-api
            image: node:14
            ports:
            - containerPort: 3000
            volumeMounts:
            - name: data
                mountPath: /app/data
            envFrom:
            - configMapRef:
                name: nodejs-api-configmap
            command: ["node"]
            args: ["app.js"]
        volumes:
        - name: data
            persistentVolumeClaim:
            claimName: nodejs-api-pvc
```

In this deployment:
- The configuration for the PostgreSQL connection is coming from the **ConfigMap**.
- A **PersistentVolumeClaim** (PVC) mounted at `/app/data` is used for storing data.
- The `node:14` Docker image is used, and it's executing the `app.js` file within the container.

2. Apply the deployment:

```bash
kubectl apply -f nodejs-api-deployment.yaml
```

This creates a single replica (Pod) of the Node.js API and binds it to the PVC and ConfigMap.

---

### Step 4: Expose the Node.js API Using MetalLB as a LoadBalancer

Now we’ll expose the deployment as a `LoadBalancer` service using **MetalLB**, so you can access the Node.js API externally.

1. Create a file named `nodejs-api-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
    name: nodejs-api
spec:
    selector:
    app: nodejs-api
    type: LoadBalancer
    ports:
    - protocol: TCP
        port: 80
        targetPort: 3000
```

2. Apply the service:

```bash
kubectl apply -f nodejs-api-service.yaml
```

Once this service is applied, **MetalLB** will assign an external IP to the service, allowing you to access it from outside the cluster.

3. Check the service to find the **external IP** assigned by MetalLB:

```bash
kubectl get svc nodejs-api
```

You should see something like this:

```
NAME          TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)        AGE
nodejs-api    LoadBalancer   10.43.45.155   192.168.88.240   80:32515/TCP   1m
```

In this case, the **EXTERNAL-IP** is `192.168.88.240`, which you can use to access the Node.js API from any machine in the network.

---

### Step 5: Example Node.js Application (Connecting to PostgreSQL)

Now let’s define the **Node.js** app (`app.js`) that will connect to PostgreSQL based on the environment variables defined in the ConfigMap.

Inside the `app.js` file, basic PostgreSQL connection code can look like this:

```javascript
const express = require("express");
const { Pool } = require("pg");

// Create the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const app = express();
const port = 3000;

// Test route to query PostgreSQL
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to connect to database" });
  }
});

// Main route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js API connected to PostgreSQL!");
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
```

Make sure that this `app.js` file is included with your Node.js Docker image or mounted as part of the deployed Pod.

---

### Step 6: Accessing Your Application

Now that everything is set up:
1. Access the Node.js API from a browser or using `curl`:

```bash
curl http://<external-ip>/
```

If you configured everything correctly, you should see a "Welcome to the Node.js API..." message.

2. Test the PostgreSQL connection:

```bash
curl http://<external-ip>/db
```

This route will query the PostgreSQL database and return the current time from the database.

---

### Summary:

- You provisioned a **Node.js API** in your K3s cluster.
- The persistent storage is managed by **Longhorn** via a **PVC**.
- The Node.js API connects to your **PostgreSQL** database (provisioned by the PostgreSQL native operator).
- The API is exposed via a **LoadBalancer** service using **MetalLB**, and the API is accessible externally.

This setup forms a fully scalable, cloud-native application architecture you can build upon in your K3s cluster.