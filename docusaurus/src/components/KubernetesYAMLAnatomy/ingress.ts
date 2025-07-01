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
    description: "The version of the Kubernetes API for Ingress resources.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Ingress",
    title: "kind",
    description: "Specifies the object type, here it is an Ingress.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-ingress`,
    title: "metadata",
    description: "Metadata for the Ingress, such as its name.",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description: "The desired state of the Ingress resource.",
  },
  {
    id: "rules",
    key: "rules:",
    value: "",
    title: "spec.rules",
    description: "Defines the rules for routing traffic.",
    indent: 2,
  },
  {
    id: "http",
    key: "http:",
    value: "",
    title: "spec.rules.http",
    description: "HTTP-specific routing information.",
    indent: 4,
  },
  {
    id: "paths",
    key: "paths:",
    value: `\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: my-app-service\n            port:\n              number: 80`,
    title: "spec.rules.http.paths",
    description: "Defines the paths and backend services for the Ingress.",
    indent: 6,
  },
];
