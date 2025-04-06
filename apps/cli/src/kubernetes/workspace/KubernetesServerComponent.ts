import K8sObject from "../types/K8sObject";
import KubernetesComponent from "./KubernetesComponent";
import { V1Service } from "@kubernetes/client-node";
import { createIngress, createService } from "../utils";
import { WorkspaceComponentConfig, WorkspaceConfig, WorkspaceServerConfig } from "../../config/types/WorkspaceConfig";
import { merge } from "../../utils/ObjectUtils";
import { PortDefinition } from "../utils/createDeployment";

export default class KubernetesServerComponent extends KubernetesComponent {
    public constructor(mainConfig: WorkspaceConfig, private serverConfig: WorkspaceServerConfig, private componentsConfig: Array<WorkspaceComponentConfig>, private deploymentName: string) {
        super(mainConfig, merge(serverConfig, {
            name: "server",
            namespace: mainConfig.namespace,
            secrets: {
                "FIREBASE_SERVICE_ACCOUNT_KEY": serverConfig.firebaseServiceAccountKey
            },
            env: {},
            ports: [
                {
                    name: "nitro",
                    protocol: "TCP",
                    number: 3001,
                    ingress: {}
                }
            ],
            volumes: []
        }));
    }

    public getResources(): Array<K8sObject> {
        const resources = super.getResources();

        const ingresses = this.componentsConfig.flatMap(it => it.ports).map(port => port.ingress).filter(ingress => ingress !== undefined);

        const ports: PortDefinition[] = [...this.config.ports, ...this.componentsConfig.flatMap(it => it.ports)].map(port => ({
            name: port.name,
            protocol: port.protocol,
            number: port.number,
            exposed: Boolean(port.ingress)
        }));

        const service = createService({
            name: `${this.formattedName}-service-clusterip`,
            namespace: this.mainConfig.namespace,
            ports: ports,
            deploymentName: this.deploymentName
        });

        const ingress = createIngress({
            name: `${this.formattedName}-ingress`,
            namespace: this.mainConfig.namespace,
            rules: uniqueBy(ingresses, it => this.getHost(it.subdomain)).map(ingress => ({
                host: this.getHost(ingress.subdomain),
                port: 3001,
                path: "/",
                service: service // ?
            }))
        });
        return [...resources, service, ingress];
    }

    private getHost(subdomain?: string) {
        let domain = this.serverConfig.domain.replace("%s", subdomain || "");
        if(!subdomain) {
            domain = domain.substring(1); // remove separator
        }
        return domain;
    }
}

function uniqueBy(array: any[], fun: (elem: any) => any) {
    return array.filter((item, pos) => array.findIndex(it => fun(it) === fun(item)) == pos);
}