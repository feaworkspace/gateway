import {V1Deployment, V1Service} from "@kubernetes/client-node";

interface ServiceDefinition {
  name: string;
  namespace: string;
  deployment: V1Deployment;
}

export default function createService(definition: ServiceDefinition): V1Service {
  const ports = definition.deployment.spec?.template.spec?.containers[0].ports;
  if (!ports) {
    throw new Error("No ports found in deployment");
  }

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: definition.name,
      namespace: definition.namespace
    },
    spec: {
      selector: {
        app: definition.name
      },
      ports: ports.map(port => ({
        port: port.containerPort,
        targetPort: port.containerPort,
        protocol: port.protocol || "TCP",
        name: port.name
      }))
    }
  };
}