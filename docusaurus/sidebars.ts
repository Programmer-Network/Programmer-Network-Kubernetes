import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "category",
      label: "1. Welcome",
      items: [
        {
          type: "doc",
          label: "1.1 Welcome",
          id: "welcome",
        },
        {
          type: "doc",
          label: "1.2 Why",
          id: "why",
        },
        {
          type: "doc",
          label: "1.3 What We Will Learn",
          id: "what-we-will-learn",
        },
      ],
    },
    {
      type: "category",
      label: "2. Hardware",
      items: [
        {
          type: "doc",
          label: "2.1 Components",
          id: "hardware-raspberry-pi-setup/hardware",
        },
        {
          type: "category",
          label: "2.2 Setup",
          items: [
            {
              type: "doc",
              label: "2.2.1 Before We Start",
              id: "hardware-raspberry-pi-setup/before-we-start",
            },
            {
              type: "doc",
              label: "2.2.2 Raspberry Pis",
              id: "hardware-raspberry-pi-setup/raspberry-pi-setup",
            },
            {
              type: "doc",
              label: "2.2.3 Mini PCs",
              id: "hardware-raspberry-pi-setup/mini-pcs-setup",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "3. Tools",
      items: [
        {
          type: "category",
          label: "3.1 Automation",
          items: [
            {
              type: "doc",
              label: "3.1.1 Ansible",
              id: "ansible/automation-with-ansible",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "4. Kubernetes",
      items: [
        {
          type: "doc",
          label: "4.1 What Is Kubernetes",
          id: "kubernetes/what-is-kubernetes",
        },
        {
          type: "doc",
          label: "4.2 Anatomy of a kubectl Command",
          id: "kubernetes/anatomy-of-kubectl-command",
        },
        {
          type: "doc",
          label: "4.3 Anatomy of a Kubernetes YAML",
          id: "kubernetes/anatomy-of-kubernetes-yaml",
        },
        {
          type: "doc",
          label: "4.4 Kubernetes 80/20 Rule",
          id: "kubernetes/kubernetes-80-20-rule",
        },
        {
          type: "doc",
          label: "4.5 K3s Setup",
          id: "kubernetes/k3s-setup",
        },
        {
          type: "doc",
          label: "4.6 K3s Backup",
          id: "kubernetes/k3s-backup",
        },
        {
          type: "doc",
          label: "4.7 K3s Maintenance",
          id: "kubernetes/k3s-maintenance",
        },
        {
          type: "category",
          label: "4.8 Storage",
          items: [
            {
              type: "doc",
              label: "4.8.1 Understanding Longhorn Concepts",
              id: "storage/understanding-longhorn-concepts",
            },
            {
              type: "doc",
              label: "4.8.2 Setup Longhorn",
              id: "storage/setup-longhorn",
            },
            {
              type: "doc",
              label: "4.8.3 Setup Longhorn Dashboard",
              id: "storage/setup-longhorn-dashboard",
            },
          ],
        },
        {
          type: "category",
          label: "4.9 Databases",
          items: [
            {
              type: "doc",
              label: "4.9.1 Databases Within Kubernetes",
              id: "databases/databases-within-kubernetes",
            },
            {
              type: "doc",
              label: "4.9.2 Setup CloudNative PG",
              id: "databases/setup-cloudnative-pg",
            },
          ],
        },
        {
          type: "category",
          label: "4.10 Networking",
          items: [
            {
              type: "doc",
              label: "4.10.1 Kubernetes Networking Explained",
              id: "networking/kubernetes-networking-explained",
            },
            {
              type: "doc",
              label: "4.10.2 Understanding Network Components",
              id: "networking/understanding-network-components",
            },
            {
              type: "doc",
              label: "4.10.3 Expose Traefik Dashboard Inside the K3s Cluster",
              id: "networking/expose-traefik-dashboard-inside-the-k3s-cluster",
            },
            {
              type: "doc",
              label: "4.10.4 Setup MetalLB",
              id: "networking/setup-metallb",
            },
          ],
        },
        {
          type: "category",
          label: "4.11 Exercises",
          items: [
            {
              type: "doc",
              label: "4.11.1 Kubernetes YML Structure",
              id: "kubernetes/kubernetes-yml-structure",
            },
            {
              type: "doc",
              label: "4.11.2 Getting Started With Kubernetes",
              id: "kubernetes/getting-started-with-kubernetes",
            },
            {
              type: "doc",
              label: "4.11.3 Common Kubernetes Commands",
              id: "kubernetes/common-kubernetes-commands",
            },
          ],
        },
      ],
    },
    {
      id: "terminology",
      type: "doc",
      label: "Terminology",
    },
  ],
};

export default sidebars;
