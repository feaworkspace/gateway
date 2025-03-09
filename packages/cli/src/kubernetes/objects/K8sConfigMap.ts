import K8sResource from "./K8sResource";
import {V1ConfigMap} from "@kubernetes/client-node";

export default class K8sConfigMap extends K8sResource {
    public constructor({ name, namespace, data}: {name: string, namespace: string, data: Record<string, string>}) {
        super({
            apiVersion: "v1",
            kind: "ConfigMap",
            metadata: { name, namespace },
            data: K8sConfigMap.dataValuesToString(data)
        });
    }

    private static dataValuesToString(data: Record<string, string>): Record<string, string> {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // @ts-ignore
            acc[key] = value + "";
            return acc;
        }, {});
    }
}

export function createK8sConfigMap(): V1ConfigMap {
    return {
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
            name: "test",
            namespace: "test"
        },
        data: {
            "key": "value"
        }
    };
}