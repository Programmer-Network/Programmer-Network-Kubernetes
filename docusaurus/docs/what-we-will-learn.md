---
title: Outcome
---

Whenever I'm learning something, I try to think about the outcome first. That's where I usually begin. It's similar to building a product. As Steve Jobs once said, "Start with the customer, and the problem, then work backwards to the technology."

I started learning Kubernetes because I wanted to enable myself to provision infrastructure with minimal effort. If I want to start building a new product and "ship fast, fail fast," infrastructure should be an afterthought. I don't want to spend time thinking about it. I should just write a few small YAML files, hit deploy, and be good to go. I shouldn't have to worry about networking, hard drives, CPUs, Logging etc. I just need an interface where I can say, "Hey, I want XYZ, give it to me.

With that in mind, this will be the outcome of this course: By the end, we'll have the ability to provision a full-stack application infrastructure in under five minutes. And to top it off, it'll cost us next to nothing, as the only expenses will be the initial investment in the bare-metal server, plus about 5 euros per month for electricity.


```mermaid
---
config:
  look: handDrawn
  layout: elk
---
flowchart TB
 subgraph Worker1["Worker Node 3"]
        api_pod1["API Pod"]
        pg_pod1["CloudNative PG Pod"]
        longhorn1["Longhorn (Storage)"]
  end
 subgraph Worker2["Worker Node 1"]
        api_pod2["API Pod"]
        pg_pod2["CloudNative PG Pod"]
        longhorn2["Longhorn (Storage)"]
  end
 subgraph Worker3["Worker Node 2"]
        api_pod3["API Pod"]
        pg_pod3["CloudNative PG Pod"]
        longhorn3["Longhorn (Storage)"]
  end
    external["Internet"] --> metallb["MetalLB (Load Balancer)"]
    metallb --> traefik["Traefik (Ingress Controller)"]
    traefik --> api_pod1 & api_pod2 & api_pod3
    api_pod1 -.-> pg_pod1
    api_pod2 -.-> pg_pod2
    api_pod3 -.-> pg_pod3
    pg_pod1 -.-> longhorn1
    pg_pod2 -.-> longhorn2
    pg_pod3 -.-> longhorn3
    master["Master Node (K3S Control Plane)"] -. manages .- Worker1 & Worker3 & Worker2
     api_pod1:::nodeStyle
     pg_pod1:::nodeStyle
     longhorn1:::nodeStyle
     api_pod2:::nodeStyle
     pg_pod2:::nodeStyle
     longhorn2:::nodeStyle
     api_pod3:::nodeStyle
     pg_pod3:::nodeStyle
     longhorn3:::nodeStyle
     master:::nodeStyle
     traefik:::nodeStyle
     metallb:::nodeStyle
     external:::nodeStyle
    style master stroke:#FF6D00,color:#FF6D00
    style Worker1 stroke:#FFD600,color:#FFD600,fill:transparent
    style Worker2 stroke:#2962FF,color:#2962FF,fill:transparent
    style Worker3 stroke:#00C853,color:#00C853,fill:transparent
    style external stroke-width:4px,stroke-dasharray: 0
    linkStyle 11 stroke:#FF6D00,fill:none
    linkStyle 12 stroke:#FF6D00,fill:none
    linkStyle 13 stroke:#FF6D00,fill:none
```
