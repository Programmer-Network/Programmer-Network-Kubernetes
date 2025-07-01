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
      "Which Kubernetes API version to use. Essential for compatibility.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Deployment",
    title: "kind",
    description:
      "The type of object to create (e.g., `Deployment`, `Service`).",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `
  name: my-app-deployment`,
    title: "metadata",
    description:
      "Unique identifiers for the object, like its `name` and `labels`.",
  },
  {
    id: "spec",
    key: "spec:",
    value: `
  replicas: 3`,
    title: "spec",
    description:
      "The **desired state**. You tell Kubernetes what you want the object to look like.",
  },
  {
    id: "selector",
    key: "selector:",
    value: `
    matchLabels:
      app: my-app`,
    title: "spec.selector",
    description:
      "How a controller (like a Deployment) finds which Pods to manage. It matches the Pods' labels.",
    indent: 2,
  },
  {
    id: "template",
    key: "template:",
    value: "",
    title: "spec.template",
    description:
      "A blueprint for creating the Pods. It has its own `metadata` and `spec`.",
    indent: 2,
  },
  {
    id: "template-metadata",
    key: "metadata:",
    value: `
      labels:
        app: my-app`,
    title: "spec.template.metadata",
    description: "Metadata for the Pods created by the template.",
    indent: 4,
  },
  {
    id: "template-spec",
    key: "spec:",
    value: "",
    title: "spec.template.spec",
    description: "Specification for the Pods created by the template.",
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
      "The heart of the Pod. A list of one or more containers to run, specifying the `image`, `ports`, etc.",
    indent: 6,
  },
];
