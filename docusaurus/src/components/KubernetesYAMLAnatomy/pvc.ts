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
    description:
      "PVCs use the core `v1` API version. They're part of Kubernetes' storage API. PVCs work with StorageClasses to dynamically provision PersistentVolumes (PVs) from available storage backends.",
  },
  {
    id: "kind",
    key: "kind:",
    value: "PersistentVolumeClaim",
    title: "kind",
    description:
      "A PVC requests storage from a StorageClass. Think of it as a 'storage reservation'—you request 10GB, and Kubernetes provisions a PersistentVolume (PV) that matches your requirements. Pods mount PVCs as volumes to get persistent storage.",
  },
  {
    id: "metadata",
    key: "metadata:",
    value: `\n  name: my-app-pvc`,
    title: "metadata",
    description:
      "The PVC name is referenced in Pod specs via `spec.volumes[].persistentVolumeClaim.claimName`. When a Pod is deleted, the PVC (and its data) persists unless you explicitly delete it. This enables data persistence across Pod restarts.",
  },
  {
    id: "spec",
    key: "spec:",
    value: "",
    title: "spec",
    description:
      "Defines storage requirements: access mode (how many Pods can mount it), storage size, and optional StorageClass. If no StorageClass is specified, the cluster's default StorageClass is used. The PVC stays in 'Pending' until a matching PV is provisioned.",
  },
  {
    id: "accessModes",
    key: "accessModes:",
    value: `\n  - ReadWriteOnce`,
    title: "spec.accessModes",
    description:
      "Defines how the volume can be mounted. `ReadWriteOnce` (RWO) allows read-write by a single node (most common). `ReadOnlyMany` (ROX) allows read-only by many nodes. `ReadWriteMany` (RWX) allows read-write by many nodes (requires NFS-like storage). Choose based on your use case.",
    indent: 2,
  },
  {
    id: "resources",
    key: "resources:",
    value: `\n    requests:\n      storage: 1Gi`,
    title: "spec.resources",
    description:
      "Storage capacity request. Use standard Kubernetes size units: `Ki` (kibibytes), `Mi` (mebibytes), `Gi` (gibibytes), `Ti` (tebibytes). The actual provisioned size may be larger depending on the storage backend. You cannot shrink a PVC—only expand it (if the StorageClass supports it).",
    indent: 2,
  },
];
