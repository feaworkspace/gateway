import { App, Repository } from "./WorkspaceFileSchema";
import { Component, Ingress, Port } from "./ComponentSchema";

export interface NamedPort extends Port {
    name: string;
}

export interface WorkspaceComponent extends Omit<Omit<Component, 'ports'>, 'env'> {
    name: string;
    namespace: string;
    nodeSelector?: { [key: string]: string };
    ports: Array<NamedPort>;
    config?: Record<string, string>;
    secrets?: Record<string, string>;
}

export interface WorkspaceAppComponent extends Omit<Omit<WorkspaceComponent, "name">, "image"> {
    name: "app";
    image: string;
    tag: string;
    domain: string;
    firebaseServiceAccountKey: string;
    subdomainFormat: string;
    ingresses: Array<Ingress>;
}

export interface WorkspaceConfig {
    version: number;
    namespace: string;
    nodeSelector?: { [key: string]: string };
    secrets?: Record<string, string>;
    repositories: Array<Repository>;
    app: WorkspaceAppComponent
    components: Array<WorkspaceComponent>;
}

export function componentToWorkspaceComponent(component: App & {name: string, namespace: string, secrets?: Record<string, string>}): WorkspaceAppComponent;
export function componentToWorkspaceComponent(component: Component & {name: string, namespace: string, secrets?: Record<string, string>}): WorkspaceComponent;
export function componentToWorkspaceComponent(component: (Component|App) & {name: string, namespace: string, secrets?: Record<string, string>}): WorkspaceComponent | WorkspaceAppComponent {
    let { ports, env, name, secrets, namespace, ...rest } = component;
    if(!secrets) {
        secrets = {};
    }

    function isSecret(value: string): boolean {
        return Object.values(secrets!).includes(value);
    }

    return {
        ...rest,
        name,
        namespace,
        config: Object.entries(env || {}).filter(([_, value]) => !isSecret(value)).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        secrets: Object.entries(env || {}).filter(([_, value]) => isSecret(value)).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        ports: Object.entries(component.ports || {}).map(([name, port]) => ({ ...port, name })),
    };
}
