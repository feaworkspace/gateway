import K8sObject from "../types/K8sObject";
import KubernetesComponent from "./KubernetesComponent";
import { V1Service } from "@kubernetes/client-node";
import { createIngress } from "../utils";
import { WorkspaceConfig, WorkspaceWorkspaceConfig } from "../../config/types/WorkspaceConfig";
import { merge } from "../../utils/ObjectUtils";

export default class KubernetesWorkspaceComponent extends KubernetesComponent {
    public constructor(mainConfig: WorkspaceConfig, config: WorkspaceWorkspaceConfig) {
        super(mainConfig, merge(config, {
            name: "workspace",
            namespace: mainConfig.namespace,
            env: {},
            volumes: [],
            ports: [
                {
                    name: "theia",
                    protocol: "TCP",
                    number: 3000,
                    ingress: {
                        subdomain: "theia"
                    }
                }
            ]
        }));
    }
}
