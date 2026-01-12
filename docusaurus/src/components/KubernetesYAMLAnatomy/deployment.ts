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
  template: {
    keyColor: "text-rose-600 dark:text-rose-400",
    cardColor: "border-2 border-rose-200 dark:border-rose-900",
    titleColor: "text-rose-700 dark:text-rose-400",
  },
  "template-metadata": {
    keyColor: "text-green-600 dark:text-green-400",
    cardColor: "border-2 border-green-200 dark:border-green-900",
    titleColor: "text-green-700 dark:text-green-400",
  },
  "template-spec": {
    keyColor: "text-purple-600 dark:text-purple-400",
    cardColor: "border-2 border-purple-200 dark:border-purple-900",
    titleColor: "text-purple-700 dark:text-purple-400",
  },
  containers: {
    keyColor: "text-yellow-600 dark:text-yellow-400",
    cardColor: "border-2 border-yellow-200 dark:border-yellow-900",
    titleColor: "text-yellow-700 dark:text-yellow-400",
  },
  status: {
    keyColor: "text-gray-600 dark:text-gray-400",
    cardColor: "border-2 border-gray-200 dark:border-gray-400",
    titleColor: "text-gray-700 dark:text-gray-400",
  },
};

export const sections = [
  {
    id: "apiVersion",
    key: "apiVersion:",
    value: "apps/v1",
    title: "apiVersion",
    description:
      "The API group and version. For Deployments, always use `apps/v1`. Different resources use different API groups (e.g., `networking.k8s.io/v1` for Ingress, `v1` for Services). Use `kubectl api-resources` to discover available API versions.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Deployment",
    title: "kind",
    description:
      "The type of Kubernetes object. `Deployment` is a controller that manages Pod replicas. It ensures the desired number of Pods are running and handles rolling updates. Other common kinds include `Service`, `Ingress`, `ConfigMap`, and `Secret`.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `
  name: my-app-deployment`,
    title: "metadata",
    description:
      "Unique identifiers for the object. The `name` is required and must be unique within a namespace. `labels` help organize and select resources. `namespace` defaults to 'default' if omitted. `annotations` store non-identifying metadata.",
  },
  {
    id: "spec",
    key: "spec:",
    value: `
  replicas: 3`,
    title: "spec",
    description:
      "The **desired state** of your Deployment. Kubernetes continuously reconciles the actual state with this desired state. If a Pod crashes, Kubernetes creates a new one to match `replicas: 3`. This is the reconciliation loop in action.",
  },
  {
    id: "selector",
    key: "selector:",
    value: `
    matchLabels:
      app: my-app`,
    title: "spec.selector",
    description:
      "How the Deployment finds which Pods to manage. The labels here **must match** the labels in `spec.template.metadata.labels`. This is how Kubernetes knows which Pods belong to this Deployment. If labels don't match, the Deployment won't manage the Pods.",
    indent: 2,
  },
  {
    id: "template",
    key: "template:",
    value: "",
    title: "spec.template",
    description:
      "A blueprint for creating Pods. This template is immutable—once a Pod is created, changes to the template don't affect existing Pods. To update running Pods, Kubernetes creates new ones with the updated template and terminates old ones (rolling update).",
    indent: 2,
  },
  {
    id: "template-metadata",
    key: "metadata:",
    value: `
      labels:
        app: my-app`,
    title: "spec.template.metadata",
    description:
      "Labels applied to Pods created from this template. These labels must match `spec.selector.matchLabels` so the Deployment can find and manage these Pods. Services also use these labels to route traffic to the Pods.",
    indent: 4,
  },
  {
    id: "template-spec",
    key: "spec:",
    value: "",
    title: "spec.template.spec",
    description:
      "The Pod specification. This defines what runs inside each Pod: containers, volumes, environment variables, resource limits, and more. Each Pod created from this template will have this exact specification.",
    indent: 4,
  },
  {
    id: "containers",
    key: "containers:",
    value: `
      - name: my-app-container
        image: nginx:latest
        ports:
        - containerPort: 80`,
    title: "spec.template.spec.containers",
    description:
      "The containers to run in each Pod. You can run multiple containers in a Pod (sidecar pattern). Common fields include `image` (required), `ports`, `env`, `resources` (CPU/memory limits), `livenessProbe`, and `readinessProbe`. Always specify resource limits in production.",
    indent: 6,
  },
];
