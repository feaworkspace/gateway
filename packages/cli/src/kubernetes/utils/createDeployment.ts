import {V1ConfigMap, V1Deployment, V1EnvFromSource, V1PersistentVolumeClaim, V1Secret} from "@kubernetes/client-node";
import {NamedPort} from "../../config/types/WorkspaceConfig";

interface DeploymentDefinition {
  name: string;
  namespace: string;
  image: string;
  replicas: number;
  ports: NamedPort[];
  nodeSelector?: Record<string, string>;
  configMap?: V1ConfigMap;
  secret?: V1Secret;
  persistentVolumeClaims?: V1PersistentVolumeClaim[];
}

export default function createDeployment(definition: DeploymentDefinition): V1Deployment {
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
          containers: [
            {
              name: definition.name,
              image: definition.image,
              ports: definition.ports.map(port => ({
                containerPort: port.number,
                name: port.name,
                protocol: port.protocol || "TCP"
              })),
              envFrom: envFrom(definition.configMap, definition.secret)
            }
          ],
          ...definition.persistentVolumeClaims && {
            volumes: definition.persistentVolumeClaims.map(pvc => ({
              name: pvc.metadata?.name!,
              persistentVolumeClaim: {
                claimName: pvc.metadata?.name!
              }
            }))
          }
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