import K8sConfigMap from "./objects/K8sConfigMap";
import K8sDeployment from "./objects/K8sDeployment";
import K8sPersistentVolumeClaim from "./objects/K8sPersistentVolumeClaim";
import K8sResource from "./objects/K8sResource";
import K8sService from "./objects/K8sService";
import {WorkspaceComponent} from "../config/types/WorkspaceConfig";
import K8sSecret from "./objects/K8sSecret";

export default class KubernetesComponent {
    public constructor(private readonly config: WorkspaceComponent) {
    }

    public getResources(): K8sResource[] {
        const formattedName = this.format(this.config.name);

        const configMap = this.config.config ? new K8sConfigMap({
            name: `${formattedName}-config`,
            namespace: this.config.namespace,
            data: this.config.config
        }) : undefined;

        const secret = this.config.secrets ? new K8sSecret({
            name: `${formattedName}-secret`,
            namespace: this.config.namespace,
            data: this.config.secrets
        }) : undefined;

        const persistentVolumeClaims = (Object.entries(this.config.volumes || {})).map(([name, volume]) => new K8sPersistentVolumeClaim({
            name: `${formattedName}-${this.format(name)}`,
            namespace: this.config.namespace,
            accessModes: ["ReadWriteOnce"],
            storageClassName: "openebs-hostpath",
            size: volume.size,
            mountPath: volume.mountPath
        }));

        const deployment = new K8sDeployment({
            name: formattedName,
            namespace: this.config.namespace,
            image: this.config.image,
            ports: this.config.ports,
            nodeSelector: this.config.nodeSelector,
            configMap,
            secret,
            persistentVolumeClaims
        });

        const service = new K8sService({
            name: formattedName,
            namespace: this.config.namespace,
            deployment
        });

        return [configMap, secret, ...persistentVolumeClaims, deployment, service].filter(resource => resource !== undefined);
    }

    /**
     * Returns the formatted name of the component.
     * Converts camelCase to kebab-case.
     */
    public format(name: string): string {
        return name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/\./g, "-").replace(/^-/, "");
    }
}