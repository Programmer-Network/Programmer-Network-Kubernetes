import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
      items: ['welcome', 'why', 'what-we-will-learn'],
    },
    {
      type: 'category',
      label: 'Hardware & PI Setup',
      items: ['hardware-raspberry-pi-setup/hardware', 'hardware-raspberry-pi-setup/raspberry-pi-setup'],
    },
    {
      type: 'category',
      label: 'Ansible',
      items: ['ansible/automation-with-ansible'],
    },
    {
      type: 'category',
      label: 'Kubernetes',
      items: ['kubernetes/kubernetes-theory', 'kubernetes/k3s-setup', 'kubernetes/k3s-backup', 'kubernetes/k3s-maintenance', 'kubernetes/getting-started-with-kubernetes', 'kubernetes/common-kubernetes-commands', {
        type: 'category',
        label: 'Storage',
        items: ['storage/understanding-longhorn-concepts', 'storage/setup-longhorn'],
      },
      {
        type: 'category',
        label: 'Databases',
        items: ['databases/setup-cloudnative-pg'],
      },
      {
        type: 'category',
        label: 'Networking',
        items: ['networking/understanding-network-components', 'networking/setup-metallb'],
      }
    ],
    },
  ],
};

export default sidebars;
