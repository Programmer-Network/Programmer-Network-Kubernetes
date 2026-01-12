export const sectionStyles = {
  apiVersion: {
    keyColor: 'text-blue-600 dark:text-blue-400',
    cardColor: 'border-2 border-blue-200 dark:border-blue-900',
    titleColor: 'text-blue-700 dark:text-blue-400',
  },
  kind: {
    keyColor: 'text-cyan-600 dark:text-cyan-400',
    cardColor: 'border-2 border-cyan-200 dark:border-cyan-900',
    titleColor: 'text-cyan-700 dark:text-cyan-400',
  },
  metadata: {
    keyColor: 'text-green-600 dark:text-green-400',
    cardColor: 'border-2 border-green-200 dark:border-green-900',
    titleColor: 'text-green-700 dark:text-green-400',
  },
  data: {
    keyColor: 'text-purple-600 dark:text-purple-400',
    cardColor: 'border-2 border-purple-200 dark:border-purple-900',
    titleColor: 'text-purple-700 dark:text-purple-400',
  },
  type: {
    keyColor: 'text-pink-600 dark:text-pink-400',
    cardColor: 'border-2 border-pink-200 dark:border-pink-900',
    titleColor: 'text-pink-700 dark:text-pink-400',
  },
}

export const sections = [
  {
    id: 'apiVersion',
    key: 'apiVersion:',
    value: 'v1',
    title: 'apiVersion',
    description:
      "Secrets use the core `v1` API version. Like ConfigMaps, they're part of Kubernetes' core resources. Secrets are base64-encoded but not encrypted—use external secret management (like Vault) for production encryption.",
  },
  {
    id: 'kind',
    key: 'kind:',
    value: 'Secret',
    title: 'kind',
    description:
      'A Secret stores sensitive data like passwords, API keys, or TLS certificates. Secrets are base64-encoded (not encrypted) and should be treated carefully. Mount them into Pods as volumes or environment variables, similar to ConfigMaps.',
  },
  {
    id: 'metadata',
    key: 'metadata:',
    value: `\n  name: my-app-secret`,
    title: 'metadata',
    description:
      'The Secret name is referenced in Pod specs via `spec.containers[].env[].valueFrom.secretKeyRef` or `spec.volumes[].secret`. Never commit Secrets to version control—use tools like Sealed Secrets, External Secrets Operator, or Vault for production.',
  },
  {
    id: 'type',
    key: 'type:',
    value: ' Opaque',
    title: 'type',
    description:
      'The Secret type determines how Kubernetes handles the data. `Opaque` (default) is for arbitrary user data. Other types include `kubernetes.io/tls` (TLS certificates), `kubernetes.io/dockerconfigjson` (Docker registry credentials), and `kubernetes.io/basic-auth` (basic authentication).',
  },
  {
    id: 'data',
    key: 'data:',
    value: `\n    PASSWORD: cGFzc3dvcmQ=  # base64 for 'password'`,
    title: 'data',
    description:
      "Key-value pairs of secret data, **base64-encoded**. Use `echo -n 'password' | base64` to encode values. For TLS certificates, use `kubernetes.io/tls` type with `tls.crt` and `tls.key` keys. Maximum size is 1MB. Use `stringData` for plain text (Kubernetes encodes it automatically).",
  },
]
