# Starting with Ansible

To get started with Ansible, check out the official [Getting Started](https://docs.ansible.com/ansible/latest/getting_started/index.html) guide.

## Installing Ansible

In order to install Ansible, in case you don't already have it, you will need to install Python. 

After that run

```python
pip install ansible
```

You might get a warning like 

```bash
ansible-doc, ansible-galaxy, ansible-inventory, ansible-playbook, ansible-pull and ansible-vault are installed in '/home/YOUR_USER/.local/bin' which is not on PATH
```

To add `/home/YOUR_USE/.local/bin` to your PATH, follow these steps:

1. **Open your shell profile file** (e.g., `.bashrc`, `.zshrc`, or `.profile`):
   ```bash
   nano ~/.bashrc
   ```
   Or, if you’re using `zsh`, open `.zshrc`:
   ```bash
   nano ~/.zshrc
   ```

2. **Add the directory to the PATH** by appending the following line at the end of the file:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

3. **Save and close the file**, then reload the profile with:
   ```bash
   source ~/.bashrc
   ```
   Or, for `zsh`:
   ```bash
   source ~/.zshrc
   ```

After this, the directory `/home/YOUR_USER/.local/bin` will be in your PATH, and you should be able to run the Ansible commands without seeing the warning.

###  Create a project folder

```bash
mkdir ansible_quickstart && cd ansible_quickstart
```


### TODO

- Create an inventory
- Create a playbook
- Explain relations between Control Node, Mannaged Nodes, Playbook, Tasks, Roles, etc


## Setting up Ansible Vault

Ansible Vault is a great way to securely store sensitive information, like IP addresses, passwords, and other secrets. Here’s a step-by-step guide to setting it up and using it for sensitive inventory data:

### Step 1: Initialize Ansible Vault
1. To create a new encrypted file, run:

```bash
ansible-vault create secrets.yml
```

2. You’ll be prompted to set a password. This password will be required to access the encrypted file.

3. Inside `secrets.yml`, you can store sensitive data in YAML format, such as IP addresses or inventory details. Here’s an example format:

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

### Step 2: Encrypt the Existing Inventory File (Optional)
If you already have an inventory file and want to encrypt it, run:
   ```bash
   ansible-vault encrypt inventory.yml
   ```

### Step 3: Use the Encrypted Inventory File
1. When running a playbook, provide the vault password with `--ask-vault-pass`:
   ```bash
   ansible-playbook -i secrets.yml --ask-vault-pass playbook.yml
   ```

2. Alternatively, create a file to store the vault password (for automation purposes):
   - Save the password in a file, e.g., `vault_pass.txt`, and protect it with permissions:
     ```bash
     chmod 600 vault_pass.txt
     ```
   - Run the playbook with the password file:
     ```bash
     ansible-playbook -i secrets.yml --vault-password-file vault_pass.txt playbook.yml
     ```

### Step 4: Editing the Encrypted File
To make changes to the encrypted file, use:
   ```bash
   ansible-vault edit secrets.yml
   ```

### Additional Tips
- **For multiple environments**: You can create separate encrypted inventory files (e.g., `prod_secrets.yml`, `dev_secrets.yml`) to manage environments.
- **Organizing secrets**: Use `group_vars` and `host_vars` directories for organizing secrets by groups or hosts, and encrypt files within those directories as needed.

This setup will keep your IP addresses, credentials, and other sensitive details secure while enabling Ansible to use them when needed.