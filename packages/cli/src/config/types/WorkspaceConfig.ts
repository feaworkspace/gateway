import {App, Repository} from "./WorkspaceFileSchema";
import {Component, Port} from "./ComponentSchema";
import YamlRenderer from "../YamlRenderer";

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

export interface AppComponent extends Omit<WorkspaceComponent, "name"> {
    name: "app";
}

export interface WorkspaceConfig {
    version: number;
    namespace: string;
    domain: string;
    subdomainFormat: string;
    nodeSelector?: { [key: string]: string };
    secrets?: Record<string, string>;
    repositories: Array<Repository>;
    components: Array<WorkspaceComponent>;
}

export function componentToWorkspaceComponent(component: Component, name: string, namespace: string, secrets: Record<string, string> = {}): WorkspaceComponent {
    function isSecret(value: string): boolean {
        return Object.values(secrets).includes(value);
    }

    const {ports, env, ...rest} = component;
    return {
        ...rest,
        name,
        namespace,
        config: Object.entries(env || {}).filter(([_, value]) => !isSecret(value)).reduce((acc, [key, value]) => ({...acc, [key]: value}), {}),
        secrets: Object.entries(env || {}).filter(([_, value]) => isSecret(value)).reduce((acc, [key, value]) => ({...acc, [key]: value}), {}),
        ports: Object.entries(component.ports || {}).map(([name, port]) => ({...port, name})),
    };
}
