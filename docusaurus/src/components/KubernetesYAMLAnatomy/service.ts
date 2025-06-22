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
    description: "The version of the Kubernetes API to use.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Service",
    title: "kind",
    description: "Specifies the object type, in this case, a Service.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `
  name: my-app-service`,
    title: "metadata",
    description:
      "Data that helps uniquely identify the object, including a name.",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description:
      "The desired state of the Service, defining how it exposes an application.",
  },
  {
    id: "selector",
    key: "selector:",
    value: `
    app: my-app`,
    title: "spec.selector",
    description:
      "Selects the Pods to which this Service will route traffic, based on their labels.",
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
      "Defines the port mapping. It forwards traffic from port 80 on the Service to port 8080 on the Pods.",
    indent: 2,
  },
];
