---
title: Mini PCs Setup
---

Setting up mini PCs differs from setting up Raspberry Pis, mainly due to hardware variations. Your experience may vary depending on your specific mini PC, but the general process should be similar. The main difference is the architecture, x86 vs ARM, and the operating systems. Raspberry Pis run on Raspbian, while our mini PCs use Ubuntu Server. Although both are Linux distributions and Debian-based, they differ slightly in configuration and the services they use.

### Goals for Mini PC Servers

When configuring mini PCs, we prioritize:

- **Low power consumption** (reduces electricity costs)
- **Low noise** (quieter operation)
- **Low heat output** (extends hardware lifespan, less cooling required)

These factors help keep costs down and ensure stable, long-term operation.

### Initial Hardware Preparation

**Clean the hardware:**

- Open the case and remove dust using compressed air.
- Check for any obvious damage or worn-out components.
- Clean the CPU using isopropyl alcohol and a microfiber cloth.
- Apply new thermal paste to the CPU. Every single Mini PC that I bought had a very worn out thermal paste. This will keep the CPU cool, and prevent it from overheating.

**Upgrade RAM (if possible):**

While not mandatory, and higly dependent on your needs and usecase, I recommend to upgrade the RAM to the maximum supported by your mini PC. You can also do this later, especially by looking for used RAM on eBay, or other platforms.

**Check storage:**

Use an SSD, preferably an NVMe, for better performance and faster boot times. Additionally, ensure the drive is healthy (consider running a SMART test).

### BIOS Settings

- Update the BIOS to the latest version (if available).
- Set the system to auto power-on after power loss. This is critical for servers, as we want to ensure that the server is always on, and that it's always available. If there is a power outage, or any other setback, we want to ensure that the server gets back online as soon as possible.
- Disable any hardware components that are not needed, e.g. Bluetooth, WiFi, etc.
- Ensure that the system is set to boot from the SSD. We want to ensure that the system doesn't have to wait for any other boot devices, e.g. USB, CD-ROM, etc.

### Ubuntu Server Installation

We'll use [Ubuntu Server](https://ubuntu.com/download/server) as the operating system.

**Recommended steps:**

- Download the Ubuntu Server ISO (choose the minimal installation option).
- Create a bootable USB drive with the ISO (e.g., using [Rufus](https://rufus.ie/) or `dd`).
- Boot the mini PC from the USB drive.
- Follow the installation prompts:

  - Select the minimal (minimized) version of Ubuntu Server. In simple words, we want to install the bare minimum to get to the command line. We won't be using any GUI, and we'll be using the command line to manage our servers.
  - Set up your user account and hostname. While hostname can be anything, I recommend setting it to something that will easily identify the server. As you will add more servers over time, you'll want to be able to easily identify them. E.g. you could have something like `lenovo-m920q-mini-pc-1`.
  - **Enable SSH during installation** (critical for remote management).
  - Partition the disk as needed (guided partitioning is fine for most users).

- Complete the installation and reboot.

### Optimize our Mini PC's

At this point, we want to do several steps that we've done under [Raspberry Pi Setup](../hardware-raspberry-pi-setup/raspberry-pi-setup.md). Essentially, we need to disable some default services, and ensure minimal power consumption. As our PC's will be running 24/7, and in many cases, will remain idle most of the time, we want to ensure that we're not wasting any resources.

Connect to your mini PC via SSH from another computer:

```sh
ssh <your-username>@<mini-pc-ip-address>
```

Update the system:

```sh
sudo apt update && sudo apt upgrade -y
```

#### Disable Swap

As with the Raspberry Pis, we want to disable swap. I have also included an [Ansible playbook](../../static/ansible/playbooks/disable-swap-ubuntu-server.yml) to automate this process. However, for the sake of learning, especially if you have multiple machines, I recommend doing the steps manually at least once to understand what’s happening. Once you’re comfortable, you can use the playbook for convenience.

To permanently disable swap on Ubuntu Server:

**Turn off swap immediately:**

```sh
sudo swapoff -a
```

**Edit /etc/fstab to prevent swap from enabling on boot:**

```sh
sudo nano /etc/fstab
```

Find any lines referencing a swap partition or swap file (they usually contain the word 'swap'). Comment out those lines by adding a `#` at the beginning, or delete them entirely.

For example:

```
#/swapfile none swap sw 0 0
```

Save and exit (`Ctrl+O`, `Enter`, then `Ctrl+X` in nano).

#### Install btop, sensors, and powertop

```sh
sudo apt install btop sensors powertop
```

You can now use `btop` to monitor the system and `sensors` to check CPU temperature. This is typically what I do when setting up a new server, it gives confidence that the thermal paste is applied correctly and the CPU is not overheating. Additionally, you can see how much memory and CPU are being used, and spot any services you may have forgotten to disable.

For `powertop`, I recommend running it once and then configuring it to run automatically at boot. This helps us understand our server's power usage and find optimization opportunities.

TODO: https://github.com/hubblo-org/scaphandre
TODO: Watch YouTube for some power consumption tips
