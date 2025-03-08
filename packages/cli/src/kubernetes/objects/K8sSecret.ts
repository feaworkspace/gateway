import K8sResource from "./K8sResource";

export default class K8sSecret extends K8sResource {
    public constructor({ name, namespace, data}: {name: string, namespace: string, data: { [key: string]: any }}) {
        super({
            apiVersion: "v1",
            kind: "Secret",
            metadata: { name, namespace },
            data: K8sSecret.dataValuesToBase64(data)
        });
    }

    private static dataValuesToBase64(data: { [key: string]: any }): { [key: string]: string } {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // @ts-ignore
            acc[key] = btoa(value.toString());
            return acc;
        }, {});
    }
}