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
  accessModes: {
    keyColor: "text-orange-600 dark:text-orange-400",
    cardColor: "border-2 border-orange-200 dark:border-orange-900",
    titleColor: "text-orange-700 dark:text-orange-400",
  },
  resources: {
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
    description: "The version of the Kubernetes API for PVC resources.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "PersistentVolumeClaim",
    title: "kind",
    description:
      "Specifies the object type, here it is a PersistentVolumeClaim.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-pvc`,
    title: "metadata",
    description: "Metadata for the PVC, such as its name.",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description: "The desired state of the PVC resource.",
  },
  {
    id: "accessModes",
    key: "accessModes:",
    value: `\n  - ReadWriteOnce`,
    title: "spec.accessModes",
    description: "Defines how the volume can be mounted (e.g., ReadWriteOnce).",
    indent: 2,
  },
  {
    id: "resources",
    key: "resources:",
    value: `\n    requests:\n      storage: 1Gi`,
    title: "spec.resources",
    description: "Specifies the amount of storage requested.",
    indent: 2,
  },
];
