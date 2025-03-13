import KubernetesComponent from "./KubernetesComponent";
import {WorkspaceConfig} from "../config/types/WorkspaceConfig";
import K8sObject from "./types/K8sObject";
import {createNamespace, createServiceAccount} from "./utils";

export default class KubernetesWorkspace {
    // private k8sApi: k8s.CoreV1Api;

    public constructor(private readonly config: WorkspaceConfig) {
        // const kc = new k8s.KubeConfig();
        // kc.loadFromDefault();
        
        // this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    public getResources(): Array<K8sObject> {
        const resources: Array<K8sObject> = [];
        resources.push(createNamespace(this.config.namespace));
        resources.push(...createServiceAccount({
            name: this.config.namespace,
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
                    apiGroups: ["traefik.io"],
                    resources: ["ingressroutes"],
                    verbs: ["create", "get", "list", "watch", "update", "patch", "delete"]
                }
            ]
        }));
        resources.push(...this.config.components.flatMap(component => new KubernetesComponent({
            ...component,
            namespace: this.config.namespace,
            nodeSelector: this.config.nodeSelector
        }).getResources()));
        return resources;
    }
}