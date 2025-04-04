import {WorkspaceComponent} from "../config/types/WorkspaceConfig";
import * as K8SUtils from "./utils";
import K8sObject from "./types/K8sObject";

export default class KubernetesComponent {
    protected readonly formattedName = this.format(this.config.name);

    public constructor(protected readonly config: WorkspaceComponent) {
        if(config.name === "app") {
            config.image = "ghcr.io/feavy/workspace/workspace-server:latest";
        }
    }

    public getResources(): Array<K8sObject> {
        const configMap = this.config.config && K8SUtils.createConfigMap({
            name: `${this.formattedName}-config`,
            namespace: this.config.namespace,
            data: this.config.config
        });

        const secret = this.config.secrets && K8SUtils.createSecret({
            name: `${this.formattedName}-secret`,
            namespace: this.config.namespace,
            stringData: this.config.secrets
        });

        const persistentVolumeClaims = (Object.entries(this.config.volumes || {})).map(([name, volume]) => K8SUtils.createPersistentVolumeClaim({
            name: `${this.formattedName}-${this.format(name)}`,
            namespace: this.config.namespace,
            accessModes: ["ReadWriteOnce"],
            storageClassName: "openebs-hostpath",
            size: volume.size,
            mountPath: volume.mountPath
        }));

        const deployment = K8SUtils.createDeployment({
            name: this.formattedName,
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
            name: this.formattedName,
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