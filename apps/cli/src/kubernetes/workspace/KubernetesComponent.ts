import * as K8SUtils from "../utils";
import K8sObject from "../types/K8sObject";
import { ContainerDefinition } from "../utils/createDeployment";
import { WorkspaceComponentConfig, WorkspaceConfig } from "../../config/types/WorkspaceConfig";
import { formatName } from "../utils/encoding";

export default class KubernetesComponent {
    protected readonly formattedName = formatName(this.config.name);

    public constructor(protected readonly mainConfig: WorkspaceConfig, protected readonly config: WorkspaceComponentConfig) {
    }
    
    public configMap = this.config.env && K8SUtils.createConfigMap({
        name: `${this.formattedName}-config`,
        namespace: this.mainConfig.namespace,
        data: this.config.env
    });
    
    public secret = this.config.secrets && K8SUtils.createSecret({
        name: `${this.formattedName}-secret`,
        namespace: this.mainConfig.namespace,
        stringData: this.config.secrets
    });

    public persistentVolumeClaims = this.config.volumes && this.config.volumes.map(volume => K8SUtils.createPersistentVolumeClaim({
        name: this.formattedName + "-" + formatName(volume.name),
        namespace: this.mainConfig.namespace,
        size: volume.size,
        mountPath: volume.mountPath,
        accessModes: ["ReadWriteOnce"],
        storageClassName: "openebs-hostpath",
    })) || [];

    public containerDefinition: ContainerDefinition = {
        name: this.formattedName,
        image: this.config.image + ":" + this.config.tag,
        configMap: this.configMap,
        secret: this.secret,
        ports: this.config.ports.map(port => ({
            name: port.name,
            protocol: port.protocol,
            number: port.number,
            exposed: Boolean(port.ingress)
        })),
        volumes: this.persistentVolumeClaims,
    }

    public getResources(): Array<K8sObject> {
        return [this.configMap, this.secret, ...this.persistentVolumeClaims].filter(Boolean) as Array<K8sObject>;
    }
}