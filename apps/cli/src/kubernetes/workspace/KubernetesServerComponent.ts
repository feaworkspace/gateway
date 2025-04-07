import K8sObject from "../types/K8sObject";
import KubernetesComponent from "./KubernetesComponent";
import { V1Deployment, V1Service } from "@kubernetes/client-node";
import { createIngress, createService } from "../utils";
import { WorkspaceComponentConfig, WorkspaceConfig, WorkspaceServerConfig } from "../../config/types/WorkspaceConfig";
import { merge } from "../../utils/ObjectUtils";
import { PortDefinition } from "../utils/createDeployment";

export default class KubernetesServerComponent extends KubernetesComponent {
    public constructor(mainConfig: WorkspaceConfig, private serverConfig: WorkspaceServerConfig, private componentsConfig: Array<WorkspaceComponentConfig>) {
        super(mainConfig, merge(serverConfig, {
            name: "server",
            namespace: mainConfig.namespace,
            secrets: {
                "FIREBASE_SERVICE_ACCOUNT_KEY": serverConfig.firebaseServiceAccountKey
            },
            env: {
                "INGRESSES": JSON.stringify(componentsConfig.map(it => it.ports).flatMap(it => it.map(port => port.ingress)).filter(it => it !== undefined))
            },
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

    public getResources(definedResources: Array<K8sObject>): Array<K8sObject> {
        const deployment = definedResources.find(it => it.kind === "Deployment") as V1Deployment;

        const ingresses = [this.config, ...this.componentsConfig].flatMap(it => it.ports).map(port => port.ingress).filter(ingress => ingress !== undefined);

        const allPorts: PortDefinition[] = [...this.config.ports, ...this.componentsConfig.flatMap(it => it.ports)].map(port => ({
            name: port.name,
            protocol: port.protocol,
            number: port.number,
            exposed: Boolean(port.ingress)
        }));

        const service = createService({
            name: this.name("clusterip"),
            namespace: this.mainConfig.namespace,
            ports: this.config.ports.map(port => ({
                name: port.name,
                protocol: port.protocol,
                number: port.number,
                exposed: true
            })),
            deployment: deployment
        });

        const ingress = createIngress({
            name: this.name("ingress"),
            namespace: this.mainConfig.namespace,
            rules: uniqueBy(ingresses, it => this.getHost(it.subdomain)).map(ingress => ({
                host: this.getHost(ingress.subdomain),
                port: 3001,
                path: "/",
                service: service // ?
            }))
        });

        return [...super.getResources(definedResources), service, ingress];
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