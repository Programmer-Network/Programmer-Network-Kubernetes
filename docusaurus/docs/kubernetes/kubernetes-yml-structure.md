---
title: Writing YAML files for Kubernetes
---

Writing YAML files for Kubernetes involves understanding the basic structure and
key components used to define cluster objects. Here's a simple logical guide to
help you write k3s YAML files manually:

### Basic Structure of a Kubernetes YAML File

#### API Version (`apiVersion`):

Every YAML file starts with an API version. It's a string that indicates the
version of the Kubernetes API you're using for the object.

Common examples include:

- `apiVersion: v1` for core objects like Services and Pods.
- `apiVersion: apps/v1` for objects like Deployments.
- Other versions might be `networking.k8s.io/v1` for Ingress.

---

**Kind (`kind`)**:

- This represents the type of Kubernetes resource you're defining.

Some common kinds are:

- `Pod`
- `Service`
- `Deployment`
- `Ingress`

---

**Metadata (`metadata`)**:

This section includes basic metadata about the object, such as:

    - `name`: A unique identifier for the object within its namespace.
    - `namespace`: (Optional) Defines the namespace where the object should be created or managed.
    - `labels`: (Optional) Key-value pairs to organize and select groups of objects.

---

**Spec (`spec`)**:

This section contains the specifications of the object.

It varies significantly between different kinds, but here are some general
guidelines:

**For Deployments**: - Define `replicas` to set the desired number of pod
copies. - Use `selector` to match Pods with labels. - Define a `template` for
the Pod specification.

**For Services**: - Define `selector` to route traffic to the right Pods. - Set
`ports` to map incoming traffic to the target Pods.

**For Ingress**: - Define rules for routing external HTTP/S traffic to internal
services.

---

### Logical Steps to Write a k3s YAML File

**Determine the Object Type**:

Decide whether you need a Deployment, Service, Pod, etc. This dictates the
fields you'll need.

**Set the API Version and Kind**:

Reference Kubernetes documentation or k3s-specific resources to know which API
version to use and set the appropriate kind.

**Add Metadata**:

Assign a name to your object and optionally a namespace. Proper naming
conventions help manage and track resources.

**Define the Spec**:

Tailor this section based on the object type. Carefully specify details like the
number of replicas for Deployments, port mappings for Services, or routing rules
for Ingress.
