import * as k8s from '@kubernetes/client-node';
import {KubernetesObject} from "@kubernetes/client-node/dist/types";
import {V1Secret} from "@kubernetes/client-node";
import {dataValuesFromBase64} from "./utils/base64";

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

  public async getObject<T extends KubernetesObject>(apiVersion: string, kind: string, name: string): Promise<T | undefined> {
    return await this.try(this.k8sObjectApi.read({apiVersion, kind, name, namespace: this.namespace})) as unknown as T;
  }

  public async getSecret(name: string): Promise<V1Secret | undefined> {
    return await this.try(this.getObject<k8s.V1Secret>('v1', 'Secret', name));
  }

  private async try<T>(resource: Promise<T>) {
    try {
      return await resource;
    } catch {
      return undefined;
    }
  }
}