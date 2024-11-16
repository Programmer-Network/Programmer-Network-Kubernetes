Recommended order in which playbooks should be run:

- [apt update and upgrade](./apt-update.yml)
- [disable wifi](./disable-wifi.yml)
- [disable bluetooth](./disable-bluetooth.yml.yml)
- [disable swap](./disable-swap.yml)
- [enable cgroups](./enable-memory-groups.yml)
- [install ISCI tools](./install-iscsi-tools.yml)
- [join worker nodes and setup kube config](./join-worker-nodes-and-setup-kube-config.yml)