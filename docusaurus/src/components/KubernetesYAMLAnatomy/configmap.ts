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
};

export const sections = [
  {
    id: "apiVersion",
    key: "apiVersion:",
    value: "v1",
    title: "apiVersion",
    description: "The version of the Kubernetes API for ConfigMap resources.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "ConfigMap",
    title: "kind",
    description: "Specifies the object type, here it is a ConfigMap.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-config`,
    title: "metadata",
    description: "Metadata for the ConfigMap, such as its name.",
  },
  {
    id: "data",
    key: "data:",
    value: `\n  APP_ENV: production\n  LOG_LEVEL: info`,
    title: "data",
    description: "Key-value pairs of configuration data.",
  },
];
