export const contentData = {
  troubleshooting: {
    crashloop: [
      {
        id: 1,
        title: "Step 1: Check the Logs",
        content:
          'This is the most critical step. The container logs almost always contain the application error that caused the crash. <div class="mt-2"><pre class="bg-slate-800 text-white p-2 rounded-md text-xs"><code>kubectl logs &lt;pod_name&gt;</code></pre></div>',
      },
      {
        id: 2,
        title: "Step 2: Check Previous Logs",
        content:
          'The container is restarting constantly. The original error might be in the logs of a *previous* instance. <div class="mt-2"><pre class="bg-slate-800 text-white p-2 rounded-md text-xs"><code>kubectl logs &lt;pod_name&gt; --previous</code></pre></div>',
      },
      {
        id: 3,
        title: "Step 3: Check ConfigMaps & Secrets",
        content:
          "A very common cause is the application failing to start due to missing or incorrect configuration, like a database URL or password. Verify that all required ConfigMaps and Secrets are mounted correctly and contain valid data.",
      },
      {
        id: 4,
        title: "Step 4: Check Resource Limits",
        content:
          "If a container exceeds its memory limit, it will be `OOMKilled` (Exit Code 137), causing a crash loop. Check `kubectl describe pod` for the reason for the last termination.",
      },
    ],
    imagepull: [
      {
        id: 1,
        title: "Step 1: Describe the Pod",
        content:
          'This command is your source of truth. The `Events` section at the bottom will give a clear error message like "unauthorized" or "no such host". <div class="mt-2"><pre class="bg-slate-800 text-white p-2 rounded-md text-xs"><code>kubectl describe pod &lt;pod_name&gt;</code></pre></div>',
      },
      {
        id: 2,
        title: "Step 2: Check for Typos",
        content:
          "The most common cause is a simple typo in the image name or tag in your YAML manifest (e.g., `my-app:latesst` instead of `my-app:latest`). Double-check it.",
      },
      {
        id: 3,
        title: "Step 3: Verify Private Registry Secrets",
        content:
          "If pulling from a private registry, ensure your pod spec includes the correct `imagePullSecrets` and that the secret itself contains valid, base64-encoded credentials.",
      },
      {
        id: 4,
        title: "Step 4: Test Node Connectivity",
        content:
          "SSH into the affected node and manually try to reach the registry with `ping` or `curl`. This can reveal DNS or firewall issues on the node itself.",
      },
    ],
    pending: [
      {
        id: 1,
        title: "Step 1: Describe the Pod",
        content:
          'Again, this is the most important command. The `Events` section will tell you exactly why the scheduler failed, e.g., "Insufficient cpu" or "node(s) had taint that the pod didnt tolerate". <div class="mt-2"><pre class="bg-slate-800 text-white p-2 rounded-md text-xs"><code>kubectl describe pod &lt;pod_name&gt;</code></pre></div>',
      },
      {
        id: 2,
        title: "Step 2: Check Resource Requests",
        content:
          "Does the cluster have enough free CPU and memory to satisfy the pod's `resources.requests`? Use `kubectl top nodes` to see current usage.",
      },
      {
        id: 3,
        title: "Step 3: Check Taints and Tolerations",
        content:
          'Nodes can have "taints" that repel pods. A pod can only be scheduled if it has a matching "toleration." Check for mismatches between `kubectl get nodes -o custom-columns=...` and your pod spec.',
      },
      {
        id: 4,
        title: "Step 4: Check Persistent Volume Claims (PVCs)",
        content:
          "If the pod requests a PVC, the pod will remain `Pending` until the storage system can provision the requested volume. Check the status of the PVC with `kubectl get pvc` and `kubectl describe pvc`.",
      },
    ],
  },
  production: [
    {
      id: 1,
      title: "Fortify the Fortress",
      icon: "🛡️",
      description: "Harden your cluster from the host OS up to the workloads.",
      content: `
                <ul class="space-y-4 list-disc list-inside">
                  <li><strong>Harden Host OS:</strong> Set secure kernel parameters in /etc/sysctl.d/ and secure file permissions on K3s certs.</li>
                  <li><strong>Enable Audit Logging:</strong> K3s disables this by default. Enable it via kube-apiserver-args to create a forensic trail.</li>
                  <li><strong>Use RBAC Least Privilege:</strong> Avoid \`cluster-admin\`. Create narrowly-scoped Roles and RoleBindings for service accounts.</li>
                  <li><strong>Enforce Pod Security Standards (PSS):</strong> Label production namespaces with \`pod-security.kubernetes.io/enforce: restricted\`.</li>
                  <li><strong>Implement Network Policies:</strong> Start with a default-deny ingress policy in each namespace to prevent lateral movement.</li>
                </ul>
              `,
    },
    {
      id: 2,
      title: "Achieve Observability",
      icon: "📊",
      description:
        "You can't operate what you can't see. Set up monitoring and logging.",
      content: `
                <p class="mb-4"><strong>The K3s Gotcha:</strong> Standard Prometheus setups fail to monitor the control plane because components are compiled into the K3s binary, not run as pods. You must manually configure scrape jobs.</p>
                <ol class="space-y-2 list-decimal list-inside">
                    <li><strong>Configure K3s:</strong> Add args like \`etcd-expose-metrics: true\` to the K3s config on server nodes.</li>
                    <li><strong>Deploy Prometheus:</strong> Use the \`kube-prometheus-stack\` Helm chart.</li>
                    <li><strong>Add Static Scrape Configs:</strong> Add \`additionalScrapeConfigs\` to your Prometheus values to manually target the \`etcd\`, \`kube-scheduler\`, and \`kube-controller-manager\` metric endpoints on your server node IPs.</li>
                    <li><strong>Centralize Logs:</strong> Deploy a logging stack like Promtail/Loki/Grafana (PLG) to ship all container and system logs to a central, searchable location.</li>
                </ol>
              `,
    },
    {
      id: 3,
      title: 'The "Oops" Button',
      icon: "⏪",
      description:
        "A system without a tested backup is a disaster waiting to happen.",
      content: `
                <p class="mb-4">A robust strategy requires a mandatory <strong>two-tiered approach</strong>:</p>
                <ul class="space-y-4 list-disc list-inside">
                  <li><strong>Tier 1: Cluster State Backup:</strong> This is the K3s datastore. Use the built-in \`k3s etcd-snapshot\` command. Schedule automatic snapshots and send them to off-site S3 storage. <strong>Critically, you MUST also back up the server token</strong> at /var/lib/rancher/k3s/server/token, or your restored snapshot will be unusable.</li>
                  <li><strong>Tier 2: Workload & Volume Backup:</strong> This is for your applications and their persistent data. Use Velero to back up Kubernetes objects and take snapshots of Persistent Volumes via your storage provider's CSI plugin. Regularly test your restore process!</li>
                </ul>
              `,
    },
    {
      id: 4,
      title: "Automate Everything",
      icon: "🤖",
      description:
        "Adopt a GitOps workflow to manage your cluster declaratively.",
      content: `
                <p class="mb-4">Manual \`kubectl apply\` is error-prone and un-auditable at scale. GitOps treats your Git repository as the single source of truth for your cluster's state.</p>
                <ul class="space-y-2 list-disc list-inside">
                  <li><strong>Use FluxCD or ArgoCD:</strong> Deploy a GitOps agent in your cluster.</li>
                  <li><strong>Structure Your Repo:</strong> Create a Git repository with a clear separation between cluster infrastructure (MetalLB, Longhorn) and applications.</li>
                  <li><strong>Reconcile Automatically:</strong> The agent continuously compares the live state of the cluster to the "desired state" in Git, automatically applying changes or correcting drift.</li>
                  <li><strong>Audit Trail:</strong> Every change to your cluster is a version-controlled, auditable Git commit.</li>
                </ul>
              `,
    },
  ],
};
