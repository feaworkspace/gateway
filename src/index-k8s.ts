import * as k8s from '@kubernetes/client-node';


(async () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const k8sApi = k8s.KubernetesObjectApi.makeApiClient(kc);

    // const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    const namespace = new k8s.V1Namespace();
    
    await k8sApi.patch({
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: 'test-namespace'
        }
    } as k8s.V1Namespace);
})();