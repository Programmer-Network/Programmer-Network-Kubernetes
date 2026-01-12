---
title: Kubernetes Storage
---

### StorageClass - What is it?

Think of a **StorageClass** in Kubernetes as a **"recipe"** or **blueprint**
that dictates **how to create storage** for your application.

In Kubernetes, you often need to store data (like database data, logs, etc.),
and different applications might need different types of storage (some want
fast, some want big, some want highly replicated storage). To solve this,
Kubernetes uses **StorageClasses** to define how **storage should be
provisioned**.

- A **StorageClass** describes the **type of storage**: It can be based on the
  **speed**, **redundancy**, **storage provider/driver**, or **other
  properties**.
- Once defined, the StorageClass allows Kubernetes to automatically give the
  right kind of storage to any service (`Pods`) that asks for it.

So, instead of worrying about _how_ to create storage for your specific
application, you just pick a StorageClass, and Kubernetes takes care of the rest
(i.e., Kubernetes sends the request to the configured storage system).

#### Simple Analogy for a StorageClass

Imagine you're at a **pizza restaurant.** You want to order a pizza, but you
don't care about how the kitchen makes it, you just describe the type of pizza
you want by **selecting a predefined option** on the menu:

- Regular crust
- Thin crust
- Extra cheese

The kitchen (in this case, Kubernetes) **knows how to create** the pizza based
on those instructions.

In the Kubernetes world, the **"crust and cheese options"** represent different
types of storage like Longhorn, AWS EBS, Google Persistent Disks, SSDs, etc.

### PersistentVolumeClaim (PVC) - What does it do?

A **PersistentVolumeClaim (PVC)** is your way of asking for a specific amount of
storage from Kubernetes. It’s kind of like saying, "**Hey, I need 10 GB of
storage that I can use reliably and persistently**."

- A **PVC** is a request for storage: In the PVC, you specify **how much
  storage** you need (e.g., 10 GB or 50 GB), and **what kind of access** you
  need (e.g., read only or read/write).
- The PVC gets "matched" to a **PersistentVolume** (an actual piece of storage)
  through the **StorageClass** you define. Once this happens, Kubernetes
  guarantees that the storage is reserved and available for your application
  (even if the pod is deleted or recreated).

In simpler terms, imagine your PVC as a **rental request form**. You fill it
out, specifying how much storage (like how much "house space" you need) and what
type of house (StorageClass) you're asking for. Once Kubernetes finds matching
storage (PersistentVolume), it gives you the key to that "house" (or disk) to
use.

So, the **PVC connects you to that storage**, and you can now use it for your
application's data.

#### Simple Analogy for a PVC

Let's go back to the **pizza restaurant** analogy. Your **PVC** is kind of like
saying:

- "_I want a pizza that’s **12 inches large**, and it should be **thin
  crust**!_"

When you make this request (PVC), the restaurant (Kubernetes) will:

1. Look at its "menu" (StorageClasses) and find the right recipe or profile that
   matches your request.
2. Bake a pizza based on that recipe (allocate PersistentVolume).
3. Serve it to you (PVC is _bound_ to the actual storage).

So, whenever you create a **PVC**, it will “claim” a matching
**PersistantVolume** from Kubernetes, ensuring that your "requested storage" is
available and bound to you for the data needs for your app.

### Putting It Together

1. **StorageClass** == A **blueprint (recipe)** that defines how to provision a
   specific type of storage (e.g., fast disk, replicated storage, etc.).

2. **PersistentVolumeClaim (PVC)** == **A request** for storage. It says, "_I
   need X amount of storage handled in Y way_", and then Kubernetes matches it
   with the right type of storage based on the **StorageClass**.

### Real Example

Let's say you're deploying a **MySQL database** in your Kubernetes cluster. It's
going to need some disk space to store data.

1. First, you'll define a **StorageClass** to tell Kubernetes where the storage
   should come from and what kind it should be (e.g., using Longhorn for local
   replicated storage).

   ```yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: longhorn
   provisioner: driver.longhorn.io
   parameters:
     numberOfReplicas: '2'
     staleReplicaTimeout: '30'
   allowVolumeExpansion: true
   reclaimPolicy: Retain
   volumeBindingMode: Immediate
   ```

2. Next, you'll make a **PersistentVolumeClaim (PVC)** that asks for, say, **5
   GB** of storage that uses this **longhorn** StorageClass.

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mysql-data
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: longhorn
     resources:
       requests:
         storage: 5Gi
   ```

Once the PVC is created, Kubernetes finds storage according to the `longhorn`
recipe and gives you **5 GB** of storage. Now your MySQL pod can use that
storage to save data files or your database.

#### Summary:

- **StorageClass**: The blueprint that defines what type of storage to give when
  storage is requested (e.g., fast SSD storage, networked storage, etc.).
- **PersistentVolumeClaim (PVC)**: A request for a specific amount of storage
  based on the criteria defined in the StorageClass (like _"I need 10 GB of disk
  space on this class of storage!"_).
