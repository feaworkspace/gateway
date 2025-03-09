import {merge} from "./utils/ObjectUtils";
import KubernetesClient from "./kubernetes/KubernetesClient";

(async () => {
  const client = new KubernetesClient("ppbo");
  console.log(await client.workspaceExists());
  console.log(await client.getSecret("ppbo-secrets"));
})();