import { WorkspaceServerComponent, WorkspaceComponent } from "../config/types/WorkspaceConfig";
import K8sObject from "./types/K8sObject";
import KubernetesComponent from "./KubernetesComponent";
import { V1Service } from "@kubernetes/client-node";
import { createIngress } from "./utils";

export default class KubernetesAppComponent extends KubernetesComponent {
    public constructor(protected config: WorkspaceServerComponent) {
        super(config);
        if(config.tag) {
            config.image = config.image.split(":")[0] + ":" + config.tag;
        }
        if(!config.secrets) {
            config.secrets = {};
        }
        config.secrets["FIREBASE_SERVICE_ACCOUNT_KEY"] = config.firebaseServiceAccountKey;
        config.ports = [
            {
                name: "theia",
                protocol: "TCP",
                number: 3000
            },
            {
                name: "frontend",
                protocol: "TCP",
                number: 3001
            }
        ];
    }

    public getResources(): Array<K8sObject> {
        const resources = super.getResources();
        const service = resources.find(it => it.kind === "Service")! as V1Service;
        const ingress = createIngress({
            name: `${this.formattedName}-ingress`,
            namespace: this.config.namespace,
            rules: uniqueBy(this.config.ingresses, it => this.getHost(it.subdomain)).map(ingress => ({
                host: this.getHost(ingress.subdomain),
                port: 3001,
                path: "/",
                service
            }))
        });
        return [...resources, ingress];
    }

    private getHost(subdomain?: string) {
        return (subdomain ? this.config.subdomainFormat.replace("%s", subdomain) : "") + this.config.domain;
    }
}

function uniqueBy(array: any[], fun: (elem: any) => any) {
    return array.filter((item, pos) => array.findIndex(it => fun(it) === fun(item)) == pos);
}