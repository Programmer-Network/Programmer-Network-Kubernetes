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
  selector: {
    keyColor: "text-orange-600 dark:text-orange-400",
    cardColor: "border-2 border-orange-200 dark:border-orange-900",
    titleColor: "text-orange-700 dark:text-orange-400",
  },
  ports: {
    keyColor: "text-pink-600 dark:text-pink-400",
    cardColor: "border-2 border-pink-200 dark:border-pink-900",
    titleColor: "text-pink-700 dark:text-pink-400",
  },
};

export const sections = [
  {
    id: "apiVersion",
    key: "apiVersion:",
    value: "v1",
    title: "apiVersion",
    description:
      "Services use the core `v1` API version. This is part of Kubernetes' core API group, unlike Deployments which use `apps/v1`. Most basic resources (Pods, Services, ConfigMaps, Secrets) use `v1`.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Service",
    title: "kind",
    description:
      "A Service provides a stable network endpoint for Pods. It acts as a load balancer, distributing traffic to matching Pods. Even when Pods are recreated (new IPs), the Service IP stays the same, providing reliable service discovery.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `
  name: my-app-service`,
    title: "metadata",
    description:
      "The Service name is used by other Pods to connect via DNS. A Service named `my-app-service` in namespace `default` is accessible at `my-app-service.default.svc.cluster.local` or simply `my-app-service` from the same namespace.",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description:
      "Defines how the Service selects Pods and exposes them. The `selector` finds Pods, and `ports` defines how traffic is routed. Service types include ClusterIP (default, internal), NodePort, and LoadBalancer.",
  },
  {
    id: "selector",
    key: "selector:",
    value: `
    app: my-app`,
    title: "spec.selector",
    description:
      "Selects Pods by matching their labels. The Service finds all Pods with `app: my-app` and routes traffic to them. If Pods are recreated with the same labels, they're automatically included. The selector must match Pod labels exactly.",
    indent: 2,
  },
  {
    id: "ports",
    key: "ports:",
    value: `
  - protocol: TCP
    port: 80
    targetPort: 8080`,
    title: "spec.ports",
    description:
      "Port mapping configuration. `port` is the Service port (what clients connect to), `targetPort` is the container port (where the app listens). `protocol` is usually TCP (default) or UDP. You can define multiple ports for services that expose multiple endpoints.",
    indent: 2,
  },
];
