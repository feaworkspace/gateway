import WorkspaceConfigRenderer from './config/WorkspaceConfigRenderer.js';
import { fromError } from 'zod-validation-error';
import KubernetesWorkspace from './kubernetes/KubernetesWorkspace.js';
import * as yaml from 'yaml'

try {
    const configRenderer = new WorkspaceConfigRenderer('workspace.yml');
    const workspaceConfig = configRenderer.render();

    const kubernetesWorkspace = new KubernetesWorkspace(workspaceConfig);
    const resources = kubernetesWorkspace.getResources();
    console.log(resources.map(resource => yaml.stringify(resource.config)).join('---\n'));
    // console.log(workspaceConfig.toYaml());
} catch (error: any) {
    const validationError = fromError(error);
    console.error(error);
    console.error(validationError.toString());
}