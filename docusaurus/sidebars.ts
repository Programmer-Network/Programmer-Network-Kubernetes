import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

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
      type: 'category',
      label: 'Welcome',
      items: [
        {
          type: 'doc',
          label: 'Welcome',
          id: 'welcome',
        },
        {
          type: 'doc',
          label: 'Why?',
          id: 'why',
        },
        {
          type: 'doc',
          label: "The reason why it's hard",
          id: 'why-is-it-hard',
        },
        {
          type: 'doc',
          label: 'The outcome',
          id: 'what-we-will-learn',
        },
      ],
    },
    {
      type: 'category',
      label: 'Hardware',
      items: [
        {
          type: 'doc',
          label: 'Components',
          id: 'hardware-raspberry-pi-setup/hardware',
        },
        {
          type: 'category',
          label: 'Setup',
          items: [
            {
              type: 'doc',
              label: 'Before We Start',
              id: 'hardware-raspberry-pi-setup/before-we-start',
            },
            {
              type: 'doc',
              label: 'Raspberry Pis',
              id: 'hardware-raspberry-pi-setup/raspberry-pi-setup',
            },
            {
              type: 'doc',
              label: 'Mini PCs',
              id: 'hardware-raspberry-pi-setup/mini-pcs-setup',
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Mikrotik',
      items: [
        {
          type: 'doc',
          label: 'Why Mikrotik?',
          id: 'networking/mikrotik/why-mikrotik',
        },
        {
          type: 'doc',
          label: 'Network Overview',
          id: 'networking/mikrotik/network-overview',
        },
        {
          type: 'doc',
          label: 'Core Concepts',
          id: 'networking/mikrotik/core-concepts',
        },
        {
          type: 'doc',
          label: 'MikroTik RouterOS on Lenovo M920q',
          id: 'networking/mikrotik/lenovo-m920q-roas',
        },
        {
          type: 'doc',
          label: 'VLAN Schema',
          id: 'networking/mikrotik/vlan-schema',
        },
        {
          type: 'doc',
          label: 'Device Configuration',
          id: 'networking/mikrotik/device-configuration',
        },
        {
          type: 'doc',
          label: 'Firewall Logic',
          id: 'networking/mikrotik/firewall-logic',
        },
        {
          type: 'doc',
          label: 'Configure Email',
          id: 'networking/mikrotik/configure-email-on-mikrotik',
        },
        {
          type: 'doc',
          label: 'Dynamic DNS with Cloudflare',
          id: 'networking/mikrotik/dynamic-dns-with-cloudflare',
        },
        {
          type: 'doc',
          label: 'Common Scenarios',
          id: 'networking/mikrotik/common-scenarios',
        },
        {
          type: 'doc',
          label: 'Summary & Checklist',
          id: 'networking/mikrotik/summary-and-checklist',
        },
      ],
    },
    {
      type: 'category',
      label: 'Kubernetes',
      items: [
        // 1. Getting Started (Setup)
        {
          type: 'doc',
          label: 'K3s Setup',
          id: 'kubernetes/k3s-setup',
        },
        // 2. Core Concepts
        {
          type: 'category',
          label: 'Core Concepts',
          items: [
            {
              type: 'doc',
              label: 'What Is Kubernetes',
              id: 'kubernetes/what-is-kubernetes',
            },
            {
              type: 'doc',
              label: 'Anatomy of a kubectl Command',
              id: 'kubernetes/anatomy-of-kubectl-command',
            },
            {
              type: 'doc',
              label: 'Anatomy of a Kubernetes YAML',
              id: 'kubernetes/anatomy-of-kubernetes-yaml',
            },
            {
              type: 'doc',
              label: 'Kubernetes 80/20 Rule',
              id: 'kubernetes/kubernetes-80-20-rule',
            },
          ],
        },
        // 3. Infrastructure Components
        {
          type: 'category',
          label: 'Storage',
          items: [
            {
              type: 'doc',
              label: 'Understanding Longhorn Concepts',
              id: 'storage/understanding-longhorn-concepts',
            },
            {
              type: 'doc',
              label: 'Setup Longhorn',
              id: 'storage/setup-longhorn',
            },
            {
              type: 'doc',
              label: 'Setup Longhorn Dashboard',
              id: 'storage/setup-longhorn-dashboard',
            },
          ],
        },
        {
          type: 'category',
          label: 'Networking',
          items: [
            {
              type: 'doc',
              label: 'Kubernetes Networking Explained',
              id: 'networking/kubernetes-networking-explained',
            },
            {
              type: 'doc',
              label: 'Understanding Network Components',
              id: 'networking/understanding-network-components',
            },
            {
              type: 'doc',
              label: 'Expose Traefik Dashboard Inside the K3s Cluster',
              id: 'networking/expose-traefik-dashboard-inside-the-k3s-cluster',
            },
            {
              type: 'doc',
              label: 'Setup MetalLB',
              id: 'networking/setup-metallb',
            },
          ],
        },
        {
          type: 'category',
          label: 'GitOps',
          items: [
            {
              type: 'doc',
              label: 'Setup ArgoCD',
              id: 'kubernetes/setup-argocd',
            },
          ],
        },
        {
          type: 'category',
          label: 'Secrets Management',
          items: [
            {
              type: 'doc',
              label: 'Setup Vault',
              id: 'kubernetes/setup-vault',
            },
          ],
        },
        // 4. Operations
        {
          type: 'category',
          label: 'K3s Backup',
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'kubernetes/k3s-backup',
            },
            {
              type: 'doc',
              label: 'etcd Snapshots',
              id: 'kubernetes/k3s-backup-etcd',
            },
            {
              type: 'doc',
              label: 'Longhorn Backups',
              id: 'kubernetes/k3s-backup-longhorn',
            },
            {
              type: 'doc',
              label: 'Velero Backups',
              id: 'kubernetes/k3s-backup-velero',
            },
            {
              type: 'doc',
              label: 'CloudNative PG Backups',
              id: 'kubernetes/k3s-backup-cloudnative-pg',
            },
            {
              type: 'doc',
              label: 'Disaster Recovery',
              id: 'kubernetes/k3s-backup-disaster-recovery',
            },
          ],
        },
        {
          type: 'category',
          label: 'K3s Maintenance',
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'kubernetes/k3s-maintenance',
            },
            {
              type: 'doc',
              label: 'Updating K3s',
              id: 'kubernetes/k3s-maintenance-updates',
            },
            {
              type: 'doc',
              label: 'Health Checks',
              id: 'kubernetes/k3s-maintenance-health',
            },
            {
              type: 'doc',
              label: 'Troubleshooting',
              id: 'kubernetes/k3s-maintenance-troubleshooting',
            },
            {
              type: 'doc',
              label: 'Node Management',
              id: 'kubernetes/k3s-maintenance-nodes',
            },
          ],
        },
        // 5. Applications
        {
          type: 'category',
          label: 'Databases',
          items: [
            {
              type: 'doc',
              label: 'Databases Within Kubernetes',
              id: 'databases/databases-within-kubernetes',
            },
            {
              type: 'doc',
              label: 'Setup CloudNative PG',
              id: 'databases/setup-cloudnative-pg',
            },
          ],
        },
        // 6. Practice
        {
          type: 'category',
          label: 'Practice',
          items: [
            {
              type: 'doc',
              label: 'Getting Started',
              id: 'kubernetes/practice/getting-started',
            },
            {
              type: 'category',
              label: 'Beginner',
              items: [
                {
                  type: 'doc',
                  label: 'Basic Kubernetes',
                  id: 'kubernetes/practice/basic-kubernetes',
                },
                {
                  type: 'doc',
                  label: 'Namespaces & Resources',
                  id: 'kubernetes/practice/namespaces-and-resources',
                },
                {
                  type: 'doc',
                  label: 'ConfigMaps & Secrets',
                  id: 'kubernetes/practice/configmaps-and-secrets',
                },
              ],
            },
            {
              type: 'category',
              label: 'Intermediate',
              items: [
                {
                  type: 'doc',
                  label: 'Persistent Volumes',
                  id: 'kubernetes/practice/persistent-volumes',
                },
                {
                  type: 'doc',
                  label: 'Longhorn Storage',
                  id: 'kubernetes/practice/longhorn-storage',
                },
                {
                  type: 'doc',
                  label: 'Services & Networking',
                  id: 'kubernetes/practice/services-and-networking',
                },
              ],
            },
            {
              type: 'category',
              label: 'Advanced',
              items: [
                {
                  type: 'doc',
                  label: 'CloudNative PG Basics',
                  id: 'kubernetes/practice/cloudnative-pg-basics',
                },
                {
                  type: 'doc',
                  label: 'CloudNative PG Advanced',
                  id: 'kubernetes/practice/cloudnative-pg-advanced',
                },
                {
                  type: 'doc',
                  label: 'Ingress with Traefik',
                  id: 'kubernetes/practice/ingress-with-traefik',
                },
                {
                  type: 'doc',
                  label: 'Complete Application',
                  id: 'kubernetes/practice/complete-application',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Tools',
      items: [
        {
          type: 'category',
          label: 'Automation',
          items: [
            {
              type: 'doc',
              label: 'Ansible',
              id: 'ansible/automation-with-ansible',
            },
          ],
        },
      ],
    },
  ],
}

// Recursively number categories and doc items
function numberSidebar(items, prefix = '') {
  let count = 1

  return items.map((item) => {
    const number = `${prefix}${count}`
    count++

    // Handle categories
    if (item.type === 'category') {
      const newLabel = `${number}. ${item.label}`
      const numberedItems = numberSidebar(item.items, number + '.')
      return {
        ...item,
        label: newLabel,
        items: numberedItems,
      }
    }

    // Handle string items (doc IDs)
    if (typeof item === 'string') {
      return {
        type: 'doc',
        id: item,
        label: `${number}. ${humanizeId(item)}`,
      }
    }

    // Handle doc objects
    if (item.type === 'doc') {
      return {
        ...item,
        label: `${number}. ${item.label || humanizeId(item.id)}`,
      }
    }

    return item
  })
}

// Helper to turn 'quick-start/basic' → 'Basic'
function humanizeId(id) {
  const parts = id.split('/')
  const last = parts[parts.length - 1]
  return last.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default {
  tutorialSidebar: numberSidebar(sidebars.tutorialSidebar),
}
