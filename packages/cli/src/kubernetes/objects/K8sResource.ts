import * as k8s from '@kubernetes/client-node';

interface KubernetesObject extends k8s.KubernetesObject {
    metadata: {
        name: string;
        namespace?: string;
    },
    [key: string]: any;
}

export default abstract class K8sResource {
    public readonly name: string;

    public constructor(public readonly config: KubernetesObject) {
        this.name = config.metadata.name;
    }
}