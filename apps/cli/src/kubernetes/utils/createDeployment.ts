import {V1ConfigMap, V1Deployment, V1EnvFromSource, V1PersistentVolumeClaim, V1Secret} from "@kubernetes/client-node";

export interface ContainerDefinition {
  name: string;
  image: string;
  configMap?: V1ConfigMap;
  secret?: V1Secret;
  ports?: PortDefinition[];
  volumes?: Array<V1PersistentVolumeClaim>;
  // volumes?: Array<{
  //   name: string,
  //   accessModes: string[],
  //   storageClassName: string,
  //   size: string
  //   mountPath: string;
  // }>;
}

export interface PortDefinition {
  name: string;
  number: number;
  protocol: string;
  exposed: boolean;
}

export interface DeploymentDefinition {
  name: string;
  namespace: string;
  replicas: number;
  nodeSelector?: Record<string, string>;
  containers: Array<ContainerDefinition>;
}

export default function createDeployment(definition: DeploymentDefinition): V1Deployment {
  const volumes = definition.containers.flatMap(container => container.volumes || []);

  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: definition.name,
      namespace: definition.namespace
    },
    spec: {
      replicas: definition.replicas,
      selector: {
        matchLabels: {
          app: definition.name
        }
      },
      template: {
        metadata: {
          labels: {
            app: definition.name
          }
        },
        spec: {
          ...definition.nodeSelector && {
            nodeSelector: definition.nodeSelector
          },
          containers: definition.containers.map(container => ({
              name: container.name,
              image: container.image,
              ports: container.ports && container.ports.map(port => ({
                containerPort: port.number,
                name: port.name,
                protocol: port.protocol
              })),
              envFrom: envFrom(container.configMap, container.secret),
              volumeMounts: container.volumes && container.volumes.map(volume => ({
                name: volume.metadata?.name!,
                mountPath: volume.metadata?.annotations?.mountPath!
              }))
          })),
          volumes: volumes.map(volume => ({
            name: volume.metadata?.name!,
            persistentVolumeClaim: {
              claimName: volume.metadata?.name!
            }
          }))
        }
      }
    }
  };
}

function envFrom(configMap?: V1ConfigMap, secret?: V1Secret): V1EnvFromSource[] {
  const env = [];
  if(configMap) {
    env.push({configMapRef: {name: configMap.metadata?.name!}});
  }
  if(secret) {
    env.push({secretRef: {name: secret.metadata?.name!}});
  }
  return env;
}