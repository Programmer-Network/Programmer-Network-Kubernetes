---
title: Mini PCs Setup
---

Setting up mini PCs is a bit different than setting up Raspberry Pi's. That is mainly because you might not have the same hardware available. Due to this, what I write here might not match your setup completely, but regardless of the hardware, worst case, it should be nearly identical.

## Setup

Typically, when thinking about PC's, we often think about the computer that one uses to surf the web, watch videos, play games, and do other things. Due to that, the way we setup the PC is a bit different. We focus on e.g. maximum performance, while paying the price of high power consumption, and high heat.

In the context of servers, especially our home "mini data center", we want to focus on low power consumption, low noise, and low heat. All of these requirements (or goals) equal low cost. Since our computers will be running 24/7, we have to do all we can to reduce the cost of running them. Additionally, we want to extend the life of the hardware, and reduce the amount of maintenance we have to do.

With that little "preface", let's get started. Whenever you get one of the used mini PCs (as I showed under [Hardware](../hardware-raspberry-pi-setup/hardware.md#mini-pcs)), you'll have to do some maintenance:

- Clean the hardware, e.g. dust,
- Clean the computer
- Install a new OS
- Install a new OS

### BIOS

### Ubuntu Server

For our Mini PCs, we'll be using [Ubuntu Server](https://ubuntu.com/download/server) as the OS. More specifically, throughout the setup process, we'll select the minimal (minimized) version of the OS.

> Ubuntu Server Minimal is a version of Ubuntu Server with a reduced set of pre-installed packages, designed for cloud deployments and situations where a smaller footprint and faster boot times are desired. It provides the bare minimum to get to the command line, making it ideal for users who know what they're doing and prefer to install only necessary software.

If you've never setup Ubuntu Server before, I recommend you to read the [How to install Ubuntu Server 22.04
](https://systemwatchers.com/index.php/blog/ubuntu-server/how-to-install-ubuntu-server-22-04/).
