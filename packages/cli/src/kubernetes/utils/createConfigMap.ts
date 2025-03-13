import {V1ConfigMap} from "@kubernetes/client-node";

interface ConfigMapDefinition {
  name: string;
  namespace: string;
  data?: Record<string, string>;
}

export default function createConfigMap({ name, namespace, data }: ConfigMapDefinition): V1ConfigMap {
  return {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name,
      namespace,
    },
    data
  };
}
