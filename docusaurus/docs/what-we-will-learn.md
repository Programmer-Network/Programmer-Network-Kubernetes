---
title: Outcome
---

Whenever I'm learning something, I try to think about the outcome first. That's where I usually begin. It's similar to building a product. As Steve Jobs once said, "Start with the customer, and the problem, then work backwards to the technology."

I started learning Kubernetes because I wanted to enable myself to provision infrastructure with minimal effort. If I want to start building a new product and "ship fast, fail fast," infrastructure should be an afterthought. I don't want to spend time thinking about it. I should just write a few small YAML files, hit deploy, and be good to go. I shouldn't have to worry about networking, hard drives, CPUs, Logging etc. I just need an interface where I can say, "Hey, I want XYZ, give it to me.

With that in mind, this will be the outcome of this course: By the end, we'll have the ability to provision a full-stack application infrastructure in under five minutes. And to top it off, it'll cost us next to nothing, as the only expenses will be the initial investment in the bare-metal server, plus about 5 euros per month for electricity.

```mermaid
%%{init: { 'theme': 'dark' } }%%
flowchart TB
  subgraph ControlPlane["K3s HA Control Plane"]
    RPI1["Raspberry Pi 1 (Control)"]
    RPI2["Raspberry Pi 2 (Control)"]
    RPI3["Raspberry Pi 3 (Control)"]
  end
  subgraph RPI4["Raspberry Pi 4 (Worker)"]
    api_pod1["API Pod"]
    pg_pod1["CloudNative PG Pod"]
    longhorn1["Longhorn (Storage)"]
  end
  subgraph HP["HP EliteDesk (Worker)"]
    api_pod2["API Pod"]
    pg_pod2["CloudNative PG Pod"]
    longhorn2["Longhorn (Storage)"]
  end
  subgraph Lenovo["Lenovo ThinkCentre (Worker)"]
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

  ControlPlane -. "manages" .-> RPI4
  ControlPlane -. "manages" .-> HP
  ControlPlane -. "manages" .-> Lenovo

  %% --- Styling to Match Screenshot ---

  %% Define reusable styles for nodes
  classDef default fill:#121212,stroke:#ccc,color:#fff
  classDef ingressNode fill:#121212,stroke:#9c27b0
  classDef controlNode fill:#121212,stroke:#e65100
  classDef workerGreenPod fill:#121212,stroke:#2e7d32
  classDef workerYellowPod fill:#121212,stroke:#f9a825
  classDef workerBluePod fill:#121212,stroke:#1565c0

  %% Apply styles to nodes
  class metallb,traefik ingressNode;
  class RPI1,RPI2,RPI3 controlNode;
  class api_pod1,pg_pod1,longhorn1 workerGreenPod;
  class api_pod2,pg_pod2,longhorn2 workerYellowPod;
  class api_pod3,pg_pod3,longhorn3 workerBluePod;

  %% Style the subgraph containers
  style ControlPlane stroke:#e65100,stroke-width:2px,fill:transparent
  style RPI4 stroke:#2e7d32,stroke-width:2px,fill:transparent
  style HP stroke:#f9a825,stroke-width:2px,fill:transparent
  style Lenovo stroke:#1565c0,stroke-width:2px,fill:transparent

  %% Style the dotted "manages" links
  linkStyle 11,12,13 stroke:#e65100,stroke-width:2px,stroke-dasharray: 5 5
```
