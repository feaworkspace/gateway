import * as k8s from '@kubernetes/client-node';
import K8sSecret from "./objects/K8sSecret";

export default class KubernetesClient {
  private readonly k8sApi: k8s.CoreV1Api;
  private readonly k8sObjectApi: k8s.KubernetesObjectApi;

  public constructor(public readonly namespace: string) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.k8sObjectApi = k8s.KubernetesObjectApi.makeApiClient(kc);
  }

  public async workspaceExists() {
    return await this.try(this.k8sApi.readNamespace({
      name: this.namespace
    })) !== undefined;
  }

  public async getSecret(name: string): Promise<K8sSecret | undefined> {
    const secret: k8s.V1Secret | undefined = await this.try(this.k8sObjectApi.read(K8sSecret.head(name, this.namespace)));
    return secret && new K8sSecret({
      name,
      namespace: this.namespace,
      data: secret.data!
    }, true);
  }

  private async try<T>(resource: Promise<T>) {
    try {
      return await resource;
    } catch {
      return undefined;
    }
  }
}