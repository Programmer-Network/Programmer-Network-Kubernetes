---
sidebar_position: 4
title: Automation with Ansible
---

After setting up one of our Raspberry Pi devices, it's easy to see how tedious it would be to SSH into the other three devices and manually repeat each step. This process is not only time-consuming but also error-prone, given that each step is done manually.

To make things more efficient, we can turn to **Ansible**, a tool that allows us to automate tasks across multiple machines. To get started, refer to the official [Getting Started](https://docs.ansible.com/ansible/latest/getting_started/index.html) guide.

## Installation and PATH Configuration

Once Ansible has been installed, you *might** encounter a warning indicating that some Ansible executables (like `ansible-doc`, `ansible-galaxy`, and others) are installed in `/home/YOUR_USER/.local/bin`, which is not included in your system’s PATH.

To resolve this, you will need to edit your shell profile. If you’re using Bash, open the `.bashrc` file with `nano ~/.bashrc`. For Zsh users, you should open `.zshrc` by running `nano ~/.zshrc`. 

At the end of the file, you should add this line:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Once you’ve saved and closed the file, reload your shell profile so that the new PATH takes effect. For Bash, you can run `source ~/.bashrc`, and for Zsh users, run `source ~/.zshrc`. After performing these steps, you should no longer see warnings related to the Ansible executables.

## Creating a Project Directory

With the setup completed, it's a good idea to create a dedicated directory to organize all your Ansible files. You can create a new directory called `ansible` and navigate into it using:

```bash
mkdir ansible && cd ansible
```

In this folder, you’ll store your playbooks, inventory files, and any other Ansible configurations.

## Setting Up Ansible Vault

Ansible Vault is a tool that allows you to securely store sensitive information such as passwords, IP addresses, or other secrets. To initialize a new encrypted vault file, use the following command:

```bash
ansible-vault create secrets.yml
```

When prompted, set a password, this password will be required every time you access or modify the vault file. After you’ve set the password, you can include sensitive data in the `secrets.yml` file using YAML format. For example, you might include the IP addresses and credentials for each Raspberry Pi:

```yaml
all:
  hosts:
    raspberry_pi_1:
      ansible_host: 192.168.1.10
    raspberry_pi_2:
      ansible_host: 192.168.1.11
    raspberry_pi_3:
      ansible_host: 192.168.1.12
    raspberry_pi_4:
      ansible_host: 192.168.1.13
  vars:
    ansible_user: pi
    ansible_password: "your_password_here"
```

If you already have an unencrypted inventory file and want to encrypt it for security, you can do so by running:

```bash
ansible-vault encrypt inventory.yml
```

To use an encrypted inventory file when running a playbook, you’ll need to provide the vault password with the `--ask-vault-pass` option, like so:

```bash
ansible-playbook -i secrets.yml --ask-vault-pass playbook.yml
```

If you prefer not to manually enter the password every time, you can store the password in a text file such as `vault_pass.txt`. Ensure that the file is protected using the following command:

```bash
chmod 600 vault_pass.txt
```

You can then run your playbook using that password file:

```bash
ansible-playbook -i secrets.yml --vault-password-file vault_pass.txt playbook.yml
```

If you need to make changes to the vault file, you can use the command:

```bash
ansible-vault edit secrets.yml
```

For more complex setups, such as managing different environments, you can create separate encrypted inventory files, like `prod_secrets.yml` and `dev_secrets.yml`. You can also organize secrets by groups or hosts by creating encrypted files for each, stored in the `group_vars` and `host_vars` directories. This approach allows for fine-grained control over your environments while keeping sensitive data secure.

By following these steps, you can ensure both automation and security when working with multiple Raspberry Pi devices through Ansible. With the help of Ansible Vault, sensitive credentials like passwords and IP addresses are encrypted and protected from unauthorized access, while still being usable whenever Ansible tasks need them.