---
sidebar_position: 5
title: What is Kubernetes? 🎥
---

As with anything in life, my experience has taught me that focusing on the essence of something and then going top-down is the best way to learn. In the context of Kubernetes, this means understanding it in a "teach me like I'm 6 years old" way. Kubernetes is a complex system, and trying to understand every component at the very beginning is overwhelming and will only lead to frustration. Plus, it won't be useful anyway, as this theory becomes important later, once things start failing (not working) and we need to debug.

So, what we need to get out of this section is the main benefit of an orchestration platform like Kubernetes: what it does, and how it can help us as engineers.

### So, what does Kubernetes actually do?

Kubernetes is basically our super-organized friend who makes sure all our apps (and the stuff they need) are running smoothly, wherever we want them, cloud, our laptop, or a bunch of servers. We tell Kubernetes what we want ("run this app, keep it healthy, make sure it can handle lots of users"), and it figures out the rest.

Basically, something like this:

- **We give it instructions**: Like, "We want 3 copies of our app running."
- **It keeps things running**: If something crashes, Kubernetes restarts it. If we need more power, it adds more copies. If we want to update our app, it helps us do it without breaking things.
- **It works anywhere**: Cloud, on-prem, hybrid, etc. Kubernetes doesn't care. It just wants to run our stuff.
- **It's all about making life easier**: Less manual work, more time for us to build cool things.

### How to Get the Most Out of It

- Check out the [official docs](https://kubernetes.io/docs/home/) - This is probably the best resource out there. If you are patient enough to read it, you will learn a lot.
- [Docker Mastery: with Kubernetes + Swarm from a Docker Captain](https://www.udemy.com/course/docker-mastery) - This is a great course to get started with Docker and Kubernetes.
- Let's not stress about the details at first. We'll learn about each individual component as we go along.
