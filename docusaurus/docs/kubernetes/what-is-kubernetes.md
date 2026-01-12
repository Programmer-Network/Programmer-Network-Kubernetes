---
sidebar_position: 5
title: What is Kubernetes? 🎥
---

As with anything in life, my experience has taught me that focusing on the
essence of something and then going top-down is the best way to learn. In the
context of Kubernetes, this means understanding it in a "teach me like I'm 6
years old" way. Kubernetes is a complex system, and trying to understand every
component at the very beginning is overwhelming and will only lead to
frustration. Plus, it won't be useful anyway, as this theory becomes important
later, once things start failing (not working) and we need to debug.

So, what we need to get out of this section is the main benefit of an
orchestration platform like Kubernetes: what it does, and how it can help us as
engineers.

## So, what does Kubernetes actually do?

Think of Kubernetes as your super-organized friend who makes sure all your apps
(and the stuff they need) are running smoothly, wherever you want them, cloud,
your laptop, or a bunch of servers. You tell Kubernetes what you want ("run this
app, keep it healthy, make sure it can handle lots of users"), and it figures
out the rest.

### The Simple Version

Kubernetes is an orchestration platform. That's a fancy way of saying it manages
your applications automatically. Here's what that means in practice:

- **You give it instructions**: Like, "I want 3 copies of my app running, and if
  one dies, replace it."
- **It keeps things running**: If something crashes, Kubernetes restarts it. If
  you need more power, it adds more copies. If you want to update your app, it
  helps you do it without breaking things.
- **It works anywhere**: Cloud, on-prem, hybrid, your basement—Kubernetes
  doesn't care. It just wants to run your stuff.
- **It's all about making life easier**: Less manual work, more time for you to
  build cool things.

### Why Should You Care?

Before diving into the technical details, it's worth understanding why
Kubernetes matters. In the real world, applications need to:

- Stay running even when things break
- Handle more users without you manually adding servers
- Update without downtime
- Work the same way whether you're testing on your laptop or running in
  production

Kubernetes handles all of this for you. Instead of manually SSH-ing into
servers, restarting services, and hoping everything works, you describe what you
want, and Kubernetes makes it happen.

### The Big Picture

At its core, Kubernetes is about **declarative management**. You declare what
you want (3 copies of my app, always running), and Kubernetes makes sure that's
the reality. It's the difference between telling someone "watch the pot and stir
it every 5 minutes" versus "keep the soup at the right temperature", one is
manual work, the other is automation.

## How to Get the Most Out of It

- Check out the [official docs](https://kubernetes.io/docs/home/) - This is
  probably the best resource out there. If you are patient enough to read it,
  you will learn a lot.
- [Docker Mastery: with Kubernetes + Swarm from a Docker Captain](https://www.udemy.com/course/docker-mastery) -
  This is a great course to get started with Docker and Kubernetes.
- Let's not stress about the details at first. We'll learn about each individual
  component as we go along.

The key is to start using it. Theory becomes useful once you've actually
deployed something and it breaks. That's when you'll appreciate why all these
components exist.
