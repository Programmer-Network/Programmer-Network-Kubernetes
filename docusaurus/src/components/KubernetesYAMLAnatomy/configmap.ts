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
    description:
      "ConfigMaps use the core `v1` API version. They're part of Kubernetes' core resources, so no special API group is needed. ConfigMaps have been stable since Kubernetes 1.2.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "ConfigMap",
    title: "kind",
    description:
      "A ConfigMap stores non-sensitive configuration data as key-value pairs. Use it for environment variables, configuration files, or command-line arguments. ConfigMaps are mounted into Pods as volumes or environment variables.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-config`,
    title: "metadata",
    description:
      "The ConfigMap name is referenced in Pod specs. Pods mount ConfigMaps via `spec.containers[].envFrom` or `spec.volumes[].configMap`. Changes to ConfigMap data don't automatically update running Pods—you may need to restart Pods or use a sidecar to watch for changes.",
  },
  {
    id: "data",
    key: "data:",
    value: `\n  APP_ENV: production\n  LOG_LEVEL: info`,
    title: "data",
    description:
      "Key-value pairs of configuration data. Values are plain strings (no base64 encoding needed, unlike Secrets). You can also use `binaryData` for binary content. Maximum size is 1MB. Use YAML multiline strings (`|` or `>`) for multi-line values.",
  },
];
