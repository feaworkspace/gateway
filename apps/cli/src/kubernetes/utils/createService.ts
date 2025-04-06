import { V1Service } from "@kubernetes/client-node";
import { PortDefinition } from "./createDeployment";

interface ServiceDefinition {
  name: string;
  namespace: string;
  ports: Array<PortDefinition>;
  deploymentName: string;
}

export default function createService(definition: ServiceDefinition): V1Service {
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: definition.name,
      namespace: definition.namespace
    },
    spec: {
      selector: {
        app: definition.deploymentName
      },
      ports: definition.ports.map(port => ({
        port: port.number,
        targetPort: port.number,
        protocol: port.protocol || "TCP",
        name: port.name
      }))
    }
  };
}