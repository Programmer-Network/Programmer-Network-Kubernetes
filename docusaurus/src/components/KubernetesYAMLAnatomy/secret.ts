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
  data: {
    keyColor: "text-purple-600 dark:text-purple-400",
    cardColor: "border-2 border-purple-200 dark:border-purple-900",
    titleColor: "text-purple-700 dark:text-purple-400",
  },
  type: {
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
    description: "The version of the Kubernetes API for Secret resources.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "Secret",
    title: "kind",
    description: "Specifies the object type, here it is a Secret.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-secret`,
    title: "metadata",
    description: "Metadata for the Secret, such as its name.",
  },
  {
    id: "type",
    key: "type:",
    value: " Opaque",
    title: "type",
    description:
      "The type of Secret. 'Opaque' is the default for arbitrary user-defined data.",
  },
  {
    id: "data",
    key: "data:",
    value: `\n    PASSWORD: cGFzc3dvcmQ=  # base64 for 'password'`,
    title: "data",
    description: "Key-value pairs of secret data, base64-encoded.",
  },
];
