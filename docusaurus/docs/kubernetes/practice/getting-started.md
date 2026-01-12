---
title: Practice Makes Perfect 🥷🏻🚀
---

At this point, your Raspberry Pis should be configured, and you should have a
basic understanding of Kubernetes. Most importantly, you know why you're
learning all of this. Now, let's move into the practical side of things by using
[`kubectl`](https://kubernetes.io/docs/reference/kubectl/) (pronounced
"kube-control").

Until we start using tools like [`helm`](https://helm.sh/),
[`kubectl`](https://kubernetes.io/docs/reference/kubectl/) will be your best
friend. As I've mentioned before in previous sections or during my
[live streams](https://www.twitch.tv/programmer_network), we should add tools
and abstractions only **once** the work becomes repetitive and frustrating.

In this case, we aren't going to use [`helm`](https://helm.sh/) until we've
learned how to use [`kubectl`](https://kubernetes.io/docs/reference/kubectl/)
thoroughly and memorized the key commands. Mastering the basics will help us
build a strong foundation and make it clear when it's time to introduce new
abstractions.

## Learning Path Overview

This practice section is organized into a progressive learning path that starts
with basic Kubernetes concepts and gradually introduces the infrastructure
components you'll use in production. Each exercise builds on the previous one,
so it's best to follow them in order.

### Prerequisites

Before starting these exercises, make sure you have:

- K3s cluster running and accessible
- `kubectl` configured and connected to your cluster
- Basic understanding of containers and YAML
- Access to your cluster via `kubectl get nodes` (should show your nodes)

### How to Use This Guide

1. **Start with Beginner exercises** - Even if you have some experience, these
   establish the foundation
2. **Complete exercises in order** - Each builds on concepts from previous ones
3. **Practice both ways** - Try commands first, then create YAML files
4. **Verify your work** - Always run the verification steps
5. **Clean up** - Remove resources after each exercise to keep your cluster
   clean

## Practice Exercises

### Beginner Level

Start here if you're new to Kubernetes. These exercises cover the fundamental
concepts you'll use everywhere.

1. **[Basic Kubernetes Resources](./basic-kubernetes)** - Pods, Deployments, and
   Services
2. **[Namespaces and Resources](./namespaces-and-resources)** - Organizing your
   cluster
3. **[ConfigMaps and Secrets](./configmaps-and-secrets)** - Managing
   configuration and sensitive data

### Intermediate Level

Once you're comfortable with basics, these exercises introduce storage and
networking concepts.

4. **[Persistent Volumes](./persistent-volumes)** - Understanding storage in
   Kubernetes
5. **[Longhorn Storage](./longhorn-storage)** - Using Longhorn for persistent
   storage
6. **[Services and Networking](./services-and-networking)** - Different service
   types and networking patterns

### Advanced Level

These exercises combine everything you've learned and introduce database
management and complete application stacks.

7. **[CloudNative PG Basics](./cloudnative-pg-basics)** - Creating and managing
   PostgreSQL clusters
8. **[CloudNative PG Advanced](./cloudnative-pg-advanced)** - Database
   management, backups, and advanced features
9. **[Complete Application](./complete-application)** - Full-stack application
   with database, storage, and services

## Progression Guide

### Level 1: Basic Kubernetes (Exercises 01-03)

**What you'll learn:**

- Creating and managing Pods, Deployments, and Services
- Working with namespaces
- Managing configuration with ConfigMaps and Secrets

**Infrastructure components:** None yet - pure Kubernetes basics

**Time estimate:** 1-2 hours

### Level 2: Storage and Networking (Exercises 04-06)

**What you'll learn:**

- PersistentVolumeClaims and storage concepts
- Using Longhorn for distributed storage
- Different service types and networking patterns

**Infrastructure components:** Longhorn

**Time estimate:** 2-3 hours

### Level 3: Databases and Advanced Topics (Exercises 07-10)

**What you'll learn:**

- Managing PostgreSQL with CloudNative PG
- Database backups and recovery
- Building complete application stacks

**Infrastructure components:** CloudNative PG, Longhorn

**Time estimate:** 3-4 hours

## Tips for Success

1. **Don't skip verification steps** - They help you understand what's happening
2. **Read error messages carefully** - Kubernetes error messages are usually
   helpful
3. **Use `kubectl describe`** - When something doesn't work, describe the
   resource to see what's wrong
4. **Clean up after each exercise** - Keeps your cluster manageable and helps
   you learn cleanup patterns
5. **Experiment** - Once you complete an exercise, try modifying it to see what
   happens

## Getting Help

If you get stuck:

1. Check the resource status: `kubectl get <resource-type> -n <namespace>`
2. Describe the resource:
   `kubectl describe <resource-type> <name> -n <namespace>`
3. Check events: `kubectl get events -n <namespace>`
4. Review logs: `kubectl logs <pod-name> -n <namespace>`

## Ready to Start?

Begin with [Exercise 1: Basic Kubernetes Resources](./basic-kubernetes) and work
through the exercises in order. Remember, the goal isn't to rush through
them—it's to build a solid understanding of how Kubernetes works in practice.

Good luck, and have fun! 🚀
