import K8sResource from "./K8sResource";

export default class K8sSecret extends K8sResource {
    public readonly stringData: Record<string, string>;

    public constructor({ name, namespace, data}: {name: string, namespace: string, data: Record<string, string>}, base64 = false) {
        super({
            ...K8sSecret.head(name, namespace),
            data: base64 ? data : K8sSecret.dataValuesToBase64(data)
        });
        this.stringData = base64 ? K8sSecret.dataValuesFromBase64(data) : data;
    }

    public static head(name: string, namespace: string) {
        return {
            apiVersion: "v1",
            kind: "Secret",
            metadata: { name, namespace },
        }
    }

    private static dataValuesToBase64(data: Record<string, string>): Record<string, string> {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // @ts-ignore
            acc[key] = btoa(value.toString());
            return acc;
        }, {});
    }

    private static dataValuesFromBase64(data: Record<string, string>): Record<string, string> {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // @ts-ignore
            acc[key] = atob(value.toString());
            return acc;
        }, {});
    }
}