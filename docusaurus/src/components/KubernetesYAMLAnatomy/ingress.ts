export const sectionStyles = {
  apiVersion: {
    keyColor: "text-blue-600 dark:text-blue-400",
    cardColor: "border-2 border-blue-200 dark:border-blue-900",
    titleColor: "text-blue-700 dark:text-blue-400",
  },
  kind: {
    keyColor: "text-cyan-600 dark:text-cyan-400",
    cardColor: "border-2 border-cyan-200 dark:border-cyan-900",
    titleColor: "text-cyan-700 dark:text-cyan-400",
  },
  metadata: {
    keyColor: "text-green-600 dark:text-green-400",
    cardColor: "border-2 border-green-200 dark:border-green-900",
    titleColor: "text-green-700 dark:text-green-400",
  },
  spec: {
    keyColor: "text-purple-600 dark:text-purple-400",
    cardColor: "border-2 border-purple-200 dark:border-purple-900",
    titleColor: "text-purple-700 dark:text-purple-400",
  },
  rules: {
    keyColor: "text-orange-600 dark:text-orange-400",
    cardColor: "border-2 border-orange-200 dark:border-orange-900",
    titleColor: "text-orange-700 dark:text-orange-400",
  },
  http: {
    keyColor: "text-pink-600 dark:text-pink-400",
    cardColor: "border-2 border-pink-200 dark:border-pink-900",
    titleColor: "text-pink-700 dark:text-pink-400",
  },
  paths: {
    keyColor: "text-yellow-600 dark:text-yellow-400",
    cardColor: "border-2 border-yellow-200 dark:border-yellow-900",
    titleColor: "text-yellow-700 dark:text-yellow-400",
  },
};

export const sections = [
  {
    id: "apiVersion",
    key: "apiVersion:",
    value: "networking.k8s.io/v1",
    title: "apiVersion",
    description:
      "Ingress uses the `networking.k8s.io/v1` API group. Always use `v1` (not `v1beta1` which is deprecated). This API group contains networking-related resources like Ingress and NetworkPolicy.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Ingress",
    title: "kind",
    description:
      "An Ingress exposes HTTP and HTTPS routes from outside the cluster to Services within the cluster. It requires an Ingress Controller (like Traefik, NGINX, or cloud-provider load balancers) to function. Think of it as a reverse proxy configuration.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-ingress`,
    title: "metadata",
    description:
      "The Ingress name and optional annotations. Annotations are crucial for Ingress—they configure the Ingress Controller (e.g., `cert-manager.io/cluster-issuer: letsencrypt-prod` for TLS certificates).",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description:
      "Defines routing rules and TLS configuration. The Ingress Controller reads this spec to configure routing. You can specify multiple hosts, paths, and TLS certificates here.",
  },
  {
    id: "rules",
    key: "rules:",
    value: "",
    title: "spec.rules",
    description:
      "Routing rules for the Ingress. Each rule can match a specific hostname (optional) and define paths. If no host is specified, the rule matches all hosts. Rules are evaluated in order.",
    indent: 2,
  },
  {
    id: "http",
    key: "http:",
    value: "",
    title: "spec.rules.http",
    description:
      "HTTP routing configuration for a rule. Contains the list of paths that should be routed to backend Services. You can also define TLS configuration at the rule level.",
    indent: 4,
  },
  {
    id: "paths",
    key: "paths:",
    value: `\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: my-app-service\n            port:\n              number: 80`,
    title: "spec.rules.http.paths",
    description:
      "Path-based routing rules. `path` is the URL path, `pathType` can be `Exact`, `Prefix`, or `ImplementationSpecific`. The `backend` references a Service by name and port. This routes `/` requests to `my-app-service:80`.",
    indent: 6,
  },
];
