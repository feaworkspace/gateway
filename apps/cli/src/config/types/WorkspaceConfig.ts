import { Server, Repository, Script } from "./WorkspaceFileSchema";
import { Component, Ingress, Port, Volume } from "./ComponentSchema";

export interface NamedPort extends Port {
    name: string;
}

export interface WorkspaceComponent {
    name: string;
    image: string;
    namespace: string;
    nodeSelector?: { [key: string]: string };
    ports?: Array<NamedPort>;
    env?: Record<string, string>;
    volumes?: Record<string, Volume>;
    secrets?: Record<string, string>;
}

export interface WorkspaceServerComponent extends WorkspaceComponent {
    name: "webserver";
    image: string;
    tag: string;
    domain: string;
    firebaseServiceAccountKey: string;
    subdomainFormat: string;
    ingresses: Array<Ingress>;
}

export interface WorkspaceWorkspaceComponent extends WorkspaceComponent {
    name: "workspace";
    image: string;
    tag?: string;
    initScripts: Array<Script>;
    repositories: Array<Repository>;
}

export interface WorkspaceConfig {
    version: number;
    namespace: string;
    nodeSelector?: { [key: string]: string };
    secrets?: Record<string, string>;
    server: WorkspaceServerComponent
    workspace: WorkspaceWorkspaceComponent;
    components: Array<WorkspaceComponent>;
}
