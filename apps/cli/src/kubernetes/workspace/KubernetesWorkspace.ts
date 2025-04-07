import KubernetesComponent from "./KubernetesComponent";
import K8sObject from "../types/K8sObject";
import { createConfigMap, createDeployment, createNamespace, createPersistentVolumeClaim, createService, createServiceAccount } from "../utils";
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

    
    public name(...suffixes: string[]) {
        return formatName([this.config.name, "workspace", ...suffixes].join("-"));
    }

    public getResources(): Array<K8sObject> {
        const resources: Array<K8sObject> = [];
        resources.push(createNamespace(this.config.namespace));
        resources.push(...createServiceAccount({
            name: this.name("sa"),
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
        
        const workspaceComponent = new KubernetesWorkspaceComponent(this.config, this.config.workspace);
        const serverComponent = new KubernetesServerComponent(this.config, this.config.server, [workspaceComponent.config, ...this.config.components] as WorkspaceComponentConfig[]);
        const kubernetesComponents = [
            ...this.config.components.map(componentConfig => new KubernetesComponent(this.config, componentConfig as WorkspaceComponentConfig)),
            workspaceComponent,
            serverComponent,
        ];

        const pvc = resources.pushAndGet(createPersistentVolumeClaim({
            name: this.name("pvc"),
            namespace: this.config.namespace,
            size: this.config.pvc.size,
            accessModes: ["ReadWriteOnce"],
            storageClassName: this.config.pvc.storageClassName,
        }));

        const containers = kubernetesComponents.flatMap(component => component.containerDefinition);

        resources.push(createDeployment({
            name: this.name("deployment"),
            namespace: this.config.namespace,
            containers: containers,
            nodeSelector: this.config.nodeSelector,
            replicas: 1,
            volume: pvc
        }));

        for(const component of kubernetesComponents) {
            resources.push(...component.getResources(resources));
        }

        resources.push(createConfigMap({
            name: this.name("state"),
            namespace: this.config.namespace,
            data: {
                "state": JSON.stringify(resources.map(it => ({
                    apiVersion: it.apiVersion,
                    kind: it.kind,
                    metadata: {
                        name: it.metadata?.name,
                        namespace: it.metadata?.namespace
                    }
                })))
            }
        }));


        return resources;
    }

    private getHost(subdomain?: string) {
        let domain = this.config.server.domain.replace("%s", subdomain || "");
        if(!subdomain) {
            domain = domain.substring(1); // remove separator
        }
        return domain;
    }
}

function uniqueBy(array: any[], fun: (elem: any) => any) {
    return array.filter((item, pos) => array.findIndex(it => fun(it) === fun(item)) == pos);
}