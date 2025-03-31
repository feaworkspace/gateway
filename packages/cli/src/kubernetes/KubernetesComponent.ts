import {WorkspaceComponent} from "../config/types/WorkspaceConfig";
import * as K8SUtils from "./utils";
import K8sObject from "./types/K8sObject";

export default class KubernetesComponent {
    public constructor(private readonly config: WorkspaceComponent) {
        if(config.name === "app") {
            config.image = "ghcr.io/feavy/workspace/workspace-server:latest";
        }
    }

    public getResources(): Array<K8sObject> {
        const formattedName = this.format(this.config.name);

        const configMap = this.config.config && K8SUtils.createConfigMap({
            name: `${formattedName}-config`,
            namespace: this.config.namespace,
            data: this.config.config
        });

        const secret = this.config.secrets && K8SUtils.createSecret({
            name: `${formattedName}-secret`,
            namespace: this.config.namespace,
            stringData: this.config.secrets
        });

        const persistentVolumeClaims = (Object.entries(this.config.volumes || {})).map(([name, volume]) => K8SUtils.createPersistentVolumeClaim({
            name: `${formattedName}-${this.format(name)}`,
            namespace: this.config.namespace,
            accessModes: ["ReadWriteOnce"],
            storageClassName: "openebs-hostpath",
            size: volume.size,
            mountPath: volume.mountPath
        }));

        const deployment = K8SUtils.createDeployment({
            name: formattedName,
            namespace: this.config.namespace,
            image: this.config.image,
            replicas: 1,
            ports: this.config.ports,
            nodeSelector: this.config.nodeSelector,
            configMap,
            secret,
            persistentVolumeClaims
        });

        let service = this.config.ports?.length && K8SUtils.createService({
            name: formattedName,
            namespace: this.config.namespace,
            deployment
        });

        return [configMap, secret, ...persistentVolumeClaims, deployment, service].filter(Boolean) as K8sObject[];
    }

    /**
     * Returns the formatted name of the component.
     * Converts camelCase to kebab-case.
     */
    public format(name: string): string {
        return name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/\./g, "-").replace(/^-/, "");
    }
}