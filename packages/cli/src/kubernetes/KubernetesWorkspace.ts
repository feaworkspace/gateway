import KubernetesComponent from "./KubernetesComponent";
import { WorkspaceAppComponent, WorkspaceConfig } from "../config/types/WorkspaceConfig";
import K8sObject from "./types/K8sObject";
import { createNamespace, createSecret, createServiceAccount } from "./utils";
import KubernetesAppComponent from "./KubernetesAppComponent";

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
        resources.push(createSecret({
            name: "workspace-secrets",
            namespace: this.config.namespace,
            stringData: this.config.secrets
        }));
        resources.push(...this.config.components.flatMap(component =>
            (component.name === "app" ? new KubernetesAppComponent({
                ...component,
                namespace: this.config.namespace,
                nodeSelector: this.config.nodeSelector,
                ingresses: this.config.ingresses,
                firebaseServiceAccountKey: this.config.firebaseServiceAccountKey,
                subdomainFormat: this.config.subdomainFormat,
                domain: this.config.domain
            } as WorkspaceAppComponent) : new KubernetesComponent({
                ...component,
                namespace: this.config.namespace,
                nodeSelector: this.config.nodeSelector
            })).getResources()));
        return resources;
    }
}