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
      label: "Welcome",
      items: [
        {
          type: "doc",
          label: "Welcome",
          id: "welcome",
        },
        {
          type: "doc",
          label: "Why",
          id: "why",
        },
        {
          type: "doc",
          label: "What We Will Learn",
          id: "what-we-will-learn",
        },
      ],
    },
    {
      type: "category",
      label: "Hardware",
      items: [
        {
          type: "doc",
          label: "Components",
          id: "hardware-raspberry-pi-setup/hardware",
        },
        {
          type: "category",
          label: "Setup",
          items: [
            {
              type: "doc",
              label: "Before We Start",
              id: "hardware-raspberry-pi-setup/before-we-start",
            },
            {
              type: "doc",
              label: "Raspberry Pis",
              id: "hardware-raspberry-pi-setup/raspberry-pi-setup",
            },
            {
              type: "doc",
              label: "Mini PCs",
              id: "hardware-raspberry-pi-setup/mini-pcs-setup",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Tools",
      items: [
        {
          type: "category",
          label: "Automation",
          items: [
            {
              type: "doc",
              label: "Ansible",
              id: "ansible/automation-with-ansible",
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Kubernetes",
      items: [
        {
          type: "doc",
          label: "What Is Kubernetes",
          id: "kubernetes/what-is-kubernetes",
        },
        {
          type: "doc",
          label: "Anatomy of a kubectl Command",
          id: "kubernetes/anatomy-of-kubectl-command",
        },
        {
          type: "doc",
          label: "Anatomy of a Kubernetes YAML",
          id: "kubernetes/anatomy-of-kubernetes-yaml",
        },
        {
          type: "doc",
          label: "Kubernetes 80/20 Rule",
          id: "kubernetes/kubernetes-80-20-rule",
        },
        {
          type: "doc",
          label: "K3s Setup",
          id: "kubernetes/k3s-setup",
        },
        {
          type: "doc",
          label: "K3s Backup",
          id: "kubernetes/k3s-backup",
        },
        {
          type: "doc",
          label: "K3s Maintenance",
          id: "kubernetes/k3s-maintenance",
        },
        {
          type: "category",
          label: "Storage",
          items: [
            {
              type: "doc",
              label: "Understanding Longhorn Concepts",
              id: "storage/understanding-longhorn-concepts",
            },
            {
              type: "doc",
              label: "Setup Longhorn",
              id: "storage/setup-longhorn",
            },
            {
              type: "doc",
              label: "Setup Longhorn Dashboard",
              id: "storage/setup-longhorn-dashboard",
            },
          ],
        },
        {
          type: "category",
          label: "Databases",
          items: [
            {
              type: "doc",
              label: "Databases Within Kubernetes",
              id: "databases/databases-within-kubernetes",
            },
            {
              type: "doc",
              label: "Setup CloudNative PG",
              id: "databases/setup-cloudnative-pg",
            },
          ],
        },
        {
          type: "category",
          label: "Networking",
          items: [
            {
              type: "doc",
              label: "Kubernetes Networking Explained",
              id: "networking/kubernetes-networking-explained",
            },
            {
              type: "doc",
              label: "Understanding Network Components",
              id: "networking/understanding-network-components",
            },
            {
              type: "doc",
              label: "Expose Traefik Dashboard Inside the K3s Cluster",
              id: "networking/expose-traefik-dashboard-inside-the-k3s-cluster",
            },
            {
              type: "doc",
              label: "Setup MetalLB",
              id: "networking/setup-metallb",
            },
          ],
        },
        {
          type: "category",
          label: "Exercises",
          items: [
            {
              type: "doc",
              label: "Kubernetes YML Structure",
              id: "kubernetes/kubernetes-yml-structure",
            },
            {
              type: "doc",
              label: "Getting Started With Kubernetes",
              id: "kubernetes/getting-started-with-kubernetes",
            },
            {
              type: "doc",
              label: "Common Kubernetes Commands",
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

// Recursively number categories and doc items
function numberSidebar(items, prefix = "") {
  let count = 1;

  return items.map(item => {
    const number = `${prefix}${count}`;
    count++;

    // Handle categories
    if (item.type === "category") {
      const newLabel = `${number}. ${item.label}`;
      const numberedItems = numberSidebar(item.items, number + ".");
      return {
        ...item,
        label: newLabel,
        items: numberedItems,
      };
    }

    // Handle string items (doc IDs)
    if (typeof item === "string") {
      return {
        type: "doc",
        id: item,
        label: `${number}. ${humanizeId(item)}`,
      };
    }

    // Handle doc objects
    if (item.type === "doc") {
      return {
        ...item,
        label: `${number}. ${item.label || humanizeId(item.id)}`,
      };
    }

    return item;
  });
}

// Helper to turn 'quick-start/basic' → 'Basic'
function humanizeId(id) {
  const parts = id.split("/");
  const last = parts[parts.length - 1];
  return last.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default {
  tutorialSidebar: numberSidebar(sidebars.tutorialSidebar),
};
