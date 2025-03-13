import {V1ConfigMap, V1Deployment, V1PersistentVolumeClaim, V1Secret} from "@kubernetes/client-node";
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
              ...definition.configMap && {envFrom: [{configMapRef: {name: definition.configMap.metadata?.name!}}]},
              ...definition.secret && {envFrom: [{secretRef: {name: definition.secret.metadata?.name!}}]}
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