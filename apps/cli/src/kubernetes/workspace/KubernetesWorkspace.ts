import KubernetesComponent from "./KubernetesComponent";
import K8sObject from "../types/K8sObject";
import { createDeployment, createNamespace, createServiceAccount } from "../utils";
import { WorkspaceComponentConfig, WorkspaceConfig } from "../../config/types/WorkspaceConfig";
import KubernetesWorkspaceComponent from "./KubernetesWorkspaceComponent";
import KubernetesServerComponent from "./KubernetesServerComponent";
import { formatName } from "../utils/encoding";

export default class KubernetesWorkspace {
    // private k8sApi: k8s.CoreV1Api;

    public constructor(private readonly config: WorkspaceConfig) {
        // const kc = new k8s.KubeConfig();
        // kc.loadFromDefault();

        // this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    public getResources(): Array<K8sObject> {
        const name = formatName(this.config.name) + "-workspace";

        const resources: Array<K8sObject> = [];
        resources.push(createNamespace(this.config.namespace));
        resources.push(...createServiceAccount({
            name: name,
            namespace: this.config.namespace,
            rules: [
                {
                    apiGroups: [""],
                    resources: ["pods", "services", "configmaps", "secrets"],
                    verbs: ["create", "get", "list", "watch", "update", "patch", "delete"]
                },
                {
                    apiGroups: ["apps"],
                    resources: ["deployments", "statefulsets", "daemonsets"],
                    verbs: ["create", "get", "list", "watch", "update", "patch", "delete"]
                },
                {
                    apiGroups: ["networking.k8s.io"],
                    resources: ["ingresses"],
                    verbs: ["create", "get", "list", "watch", "update", "patch", "delete"]
                },
                // {
                //     apiGroups: ["traefik.io"],
                //     resources: ["ingressroutes"],
                //     verbs: ["create", "get", "list", "watch", "update", "patch", "delete"]
                // }
            ]
        }));

        const kubernetesComponents = [
            ...this.config.components.map(componentConfig => new KubernetesComponent(this.config, componentConfig as WorkspaceComponentConfig)),
            new KubernetesWorkspaceComponent(this.config, this.config.workspace),
            new KubernetesServerComponent(this.config, this.config.server, this.config.components as WorkspaceComponentConfig[], name)
        ];

        resources.push(...kubernetesComponents.flatMap(component => component.getResources()));

        const containers = kubernetesComponents.flatMap(component => component.containerDefinition);

        resources.push(createDeployment({
            name: name,
            namespace: this.config.namespace,
            containers: containers,
            // labels: {
            //     app: this.config.name
            // },
            // serviceAccountName: name,
            
            replicas: 1
        }));


        return resources;
    }
}
