import {App, Repository} from "./WorkspaceFileSchema";
import {Component, Port} from "./ComponentSchema";

export interface NamedPort extends Port {
    name: string;
}

export interface WorkspaceComponent extends Omit<Component, 'ports'> {
    name: string;
    namespace: string;
    nodeSelector?: { [key: string]: string };
    ports: Array<NamedPort>;
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
    app: App;
}