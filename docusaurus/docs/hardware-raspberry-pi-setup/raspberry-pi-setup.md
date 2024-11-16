---
sidebar_position: 3
title: Raspberry Pi Setup
---

# Raspberry Pi's Setup

For most steps, an [Ansible playbook](../../../ansible/playbooks/) is available. However, I strongly recommend that you initially set up the first Raspberry Pi manually. This hands-on approach will help you understand each step more deeply and gain practical experience. Once you've completed the manual setup, you can then use the [Ansible playbook](../../../ansible/playbooks/) to automate the same tasks across the other devices.

## Before We Start

Before we begin, I want to mention that I've provided an Ansible playbook for most of the setup tasks. While I encourage you to use it, I also recommend doing things manually at first. Experience the process, let frustration build, and allow yourself to feel the annoyance. 

Just as I did, I want you to truly understand why we use certain tools. You'll only internalize this by initially experiencing the challenges and then resolving them by introducing the right tools.

### Install the OS Using Pi Imager
- Open [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
  - Choose the `Raspberry Pi OS (other)` > `Raspberry Pi OS Lite (64-bit)`
  - The tool will download the selected OS image for you.
  - Plug in your SSD and select it in the 'Storage' section.
  - - *Note*: If you're just unpacking brand new SSDs, there's a good chance you'll need to use a Disk Management tool on your operating system to initialize and allocate the available space. Otherwise, they might not appear in the Pi Imager.
  - Before writing, click on the cog icon for advanced settings.
    - Set the hostname to your desired value, e.g., `RP1`.
    - Enable SSH and select the "allow public-key authorization only" option.
  - Click on 'Write' to begin the flashing process.
  
### Initial Boot and Setup
- Insert the flashed SSD into the USB 3 port on your Raspberry Pi and power it on
- On the first boot, ssh into the Pi to perform initial configuration

### Update and Upgrade

[Ansible Playbook](../../../ansible/playbooks/apt-update.yml)

- Run the following commands to update the package list and upgrade the installed packages:

```bash
sudo apt update
sudo apt upgrade
```

## Optimize our Pi's

Since our Raspberry Pis are nodes in our cluster and will consistently be used when plugged into our Ethernet switch or router, we can optimize them by disabling unnecessary components. This reduces the number of services running on them, naturally lowering CPU and memory usage. More importantly, it reduces power consumption, leading to lower electricity bills.

### Disable Wi-Fi

[Ansible Playbook](../../../ansible/playbooks/disable-wifi.yml)

```sh
sudo vi /etc/wpa_supplicant/wpa_supplicant.conf
```

Add the following lines to the file:

```sh
network={
    ssid=""
    key_mgmt=NONE
}
```

Disable the Wi-Fi interface:

```sh
sudo ifconfig wlan0 down
```

Block the Wi-Fi module using `rfkill`:

```sh
sudo rfkill block wifi
```

Prevent the Wi-Fi module from loading at boot:

```sh
sudo nano /etc/modprobe.d/raspi-blacklist.conf
```

Add the following line:

```sh
blacklist brcmfmac
```

Reboot your Raspberry Pi:

```sh
sudo reboot
```

### Disable Swap

[Ansible Playbook](../../../ansible/playbooks/disable-swap.yml)

Disabling swap in a K3s cluster is crucial because Kubernetes relies on precise memory management to allocate resources, schedule workloads, and handle potential memory limits. When swap is enabled, it introduces unpredictability in how memory is used. The Linux kernel may move inactive memory to disk (swap), giving the impression that there is available memory when, in reality, the node might be under significant memory pressure. This can lead to performance degradation for applications, as accessing memory from the swap space (on disk) is significantly slower than accessing it from RAM. In addition, Kubernetes, by default, expects swap to be off and prevents the kubelet from running unless explicitly overridden, as swap complicates memory monitoring and scheduling.

Beyond performance, swap interferes with Kubernetes' ability to react to out-of-memory (OOM) conditions. With swap enabled, a node might avoid crashing but at the cost of drastically reduced performance, disk I/O bottlenecks, and inconsistent resource allocation. In contrast, with swap disabled, Kubernetes can correctly identify memory shortages and kill misbehaving pods in a controlled way, allowing the system to recover predictably. For edge cases like K3s, which often operate on lightweight and resource-constrained systems (e.g., Raspberry Pis or IoT devices), disabling swap ensures efficient and stable operation without unnecessary disk wear and performance hits.

- Open a terminal.
- Run the following command to turn off swap for the current session:

```bash
sudo swapoff -a
```

This command disables the swap immediately, but it will be re-enabled after a reboot unless further steps are taken.

Modify `/etc/dphys-swapfile` to Disable Swap Permanently

Open the swap configuration file `/etc/dphys-swapfile` in a text editor:

```bash
sudo nano /etc/dphys-swapfile
```

Search for the line starting with `CONF_SWAPSIZE=`.
Modify that line to read:

```bash
CONF_SWAPSIZE=0
```

Save (Ctrl+O in `nano`) and exit the editor (Ctrl+X in `nano`).

Run the following command to remove the current swap file (`/var/swap`):

```bash
sudo rm /var/swap
```

Stop the `dphys-swapfile` service, which manages swap:

```bash
sudo systemctl stop dphys-swapfile
```

Prevent the `dphys-swapfile` service from starting during system boot by disabling it:

```bash
sudo systemctl disable dphys-swapfile
```

Run the following command to verify that swap is no longer in use:

```bash
free -m
```

In the output, ensure that the "Swap" line shows `0` for total, used, and free space:

```
total used free shared buffers cached
Mem: 2003 322 1681 18 12 129
-/+ buffers/cache: 180 1822
Swap: 0 0 0
```

Finally, reboot the system in order to apply all changes fully and ensure swap remains permanently disabled:

```bash
sudo reboot
```

After the system comes back online, run `free -m` again to confirm that swap is still disabled.


### Disable Bluetooth

[Ansible Playbook](../../../ansible/playbooks/disable-bluetooth.yml)

When using Raspberry Pi devices in a Kubernetes-based environment like K3s, any unused hardware features, such as Bluetooth, can consume system resources or introduce potential security risks. Disabling Bluetooth on each Raspberry Pi optimizes performance by reducing background services and freeing up resources like CPU and memory. Additionally, by disabling an unused service, you reduce the attack surface of your Raspberry Pi-based K3s cluster, providing a more secure and streamlined operating environment.


**Stop the Bluetooth service** that might be currently running on your Raspberry Pi:

```bash
sudo systemctl stop bluetooth
```
   
**Disable the service** so it doesn't start automatically during system boot:

```bash
sudo systemctl disable bluetooth
```

This ensures that the Bluetooth service is not running in the background, conserving system resources.

To prevent the operating system from loading Bluetooth modules at boot time, you'll need to blacklist specific modules.

Open the blacklist configuration file for editing (or create it)

```bash
sudo nano /etc/modprobe.d/raspi-blacklist.conf
```

Add the following lines to disable Bluetooth modules:

```bash
blacklist btbcm      # Disables Broadcom Bluetooth module
blacklist hci_uart   # Disables hci_uart module specific to Raspberry Pi Bluetooth
```

**Save the file** (Ctrl+O in `nano`) and **exit** the editor (Ctrl+X in `nano`).

By blacklisting these modules, they won’t be loaded during boot, effectively preventing Bluetooth from running.


Bluetooth can be disabled directly at the device level by editing specific Raspberry Pi system configurations.

Open the boot configuration file for editing:

```bash
sudo nano /boot/config.txt
```

Add the following line to disable Bluetooth:

```bash
dtoverlay=disable-bt
```

Ensure no Bluetooth device can wake up your Raspberry Pi by ensuring the line is not commented out.

**Save the changes** (Ctrl+O in `nano`) and **exit** the editor (Ctrl+X in `nano`).

This command ensures that the Raspberry Pi doesn’t enable Bluetooth at boot by making system-wide firmware adjustments.

To fully apply the changes (stopping the service, blacklisting modules, and adjusting system configuration), it’s recommended to reboot the system.


```bash
sudo reboot
```

After rebooting, you can verify that Bluetooth has been disabled by checking the status of the service:
   
```bash
sudo systemctl status bluetooth
```

It should indicate that the Bluetooth service is inactive or dead.

### Fan Control

Unfortunately, due to the limitations of the [GeeekPi 1U Rack Kit for Raspberry Pi 4B, 19" 1U Rack Mount](https://www.amazon.de/-/en/gp/product/B0972928CN/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1), I couldn't optimize the fans for each Raspberry Pi. The fans included with this kit lack [PWM](https://en.wikipedia.org/wiki/Pulse-width_modulation) control and only come with a 2-pin cable. If you're using different fans that you can control, I highly recommend setting them to remain off below certain temperature thresholds. This will not only make your setup completely silent but also reduce power consumption.

## Assign Static IP Addresses

### MikroTik Router

- Open the MikroTik Web UI and navigate to `IP > DHCP Server`.
- Locate the `Leases` tab and identify the MAC addresses of your Raspberry Pi units.
- Click on the entry for each Raspberry Pi and change it from `Dynamic` to `Static`.

If you're using a different router, the process should be similar. The only possible limitation is if you're using a consumer-grade router that doesn't offer these features. In that case, you'll need to set up a DHCP server.

## Set SSH Aliases

Once you have assigned static IPs on your router, you can simplify the SSH process by setting up SSH aliases. Here's how to do it:

Open the SSH config file on your local machine:

```bash
vi ~/.ssh/config
```
    
Add the following entries for each Raspberry Pi:

```bash
Host rp1
  HostName <Master_IP>
  User YOUR_USERNAME

Host rp2
  HostName <Worker1_IP>
  User YOUR_USERNAME

Host rp3
  HostName <Worker2_IP>
  User YOUR_USERNAME

Host rp4
  HostName <Worker3_IP>
  User YOUR_USERNAME
```

Replace `<Master_IP>`, `<Worker1_IP>`, `<Worker2_IP>`, and `<Worker3_IP>` with the actual static IP addresses of your Raspberry Pis. Save and close the file.

You should now be able to SSH into each Raspberry Pi using the alias:

```bash
ssh rp1
```

That's it! You've set up SSH aliases for your Raspberry Pi cluster.