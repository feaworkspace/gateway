import * as fs from 'fs';
import * as yaml from 'yaml';
import { ScriptInclude, workspaceSchema, WorkspaceFileYaml, ComponentInclude, Script } from './types/WorkspaceFileSchema';
import { dependencyFileSchema } from './types/DependencyFileSchema';
import { scriptFileSchema } from './types/ScriptFileSchema';
import YamlRenderer from './YamlRenderer';
import { toArray } from "../utils/ObjectUtils";
import { NamedPort, WorkspaceConfig} from "./types/WorkspaceConfig";
import { Component, Ingress, Port } from './types/ComponentSchema';

export default class WorkspaceConfigRenderer {
    public ymlConfig: WorkspaceFileYaml;
    private existingSecrets: Record<string, string> = {};

    public constructor(workspaceFile: string) {
        const workspaceYml = fs.readFileSync(workspaceFile, 'utf8');
        this.ymlConfig = yaml.parse(workspaceYml);
    }

    public render(existingSecrets: Record<string, string>) {
        this.existingSecrets = existingSecrets;

        this.ymlConfig = this.renderYaml(this.ymlConfig);
        this.ymlConfig = workspaceSchema.parse(this.ymlConfig);

        this.ymlConfig.workspace.initScripts = this.ymlConfig.workspace.initScripts.map((script) => "include" in script ? this.renderScriptInclude(script) : script);
        this.ymlConfig.components = Object.fromEntries(Object.entries(this.ymlConfig.components)
                                        .flatMap(([key, value]) => "include" in value ? this.renderDependencyInclude(value, key) : [[key, value]]));

        this.ymlConfig = this.renderYaml(this.ymlConfig);

        const components: (Component & { name: string })[] = [...toArray(this.ymlConfig.components, 'name')];

        const config: WorkspaceConfig = {
            version: this.ymlConfig.version,
            namespace: this.ymlConfig.namespace,
            nodeSelector: this.ymlConfig.nodeSelector,
            secrets: this.ymlConfig.secrets,
            workspace: {
                ...this.ymlConfig.workspace,
                name: "workspace",
                namespace: this.ymlConfig.namespace,
                repositories: this.ymlConfig.workspace.repositories,
                initScripts: this.ymlConfig.workspace.initScripts as Script[],
                image: this.ymlConfig.workspace.image,
                tag: this.ymlConfig.workspace.tag,
                secrets: this.mapSecrets(this.ymlConfig.workspace.env),
                env: this.mapEnv(this.ymlConfig.workspace.env),
                ports: this.mapPorts(this.ymlConfig.workspace.ports),
            },
            server: {
                ...this.ymlConfig.server,
                namespace: this.ymlConfig.namespace,
                name: "webserver",
                tag: this.ymlConfig.server.tag,
                image: this.ymlConfig.server.image,
                ingresses: components.flatMap(component => Object.values(component.ports || {})).map(port => port.ingress).filter(Boolean) as Ingress[],
            },
            components: components.map((component) => ({
                ...component,
                name: component.name,
                namespace: this.ymlConfig.namespace,
                secrets: this.mapSecrets(this.ymlConfig.secrets),
                env: this.mapEnv(component.env),
                ports: this.mapPorts(component.ports),
            })),
        }

        return config;
    }

    private mapSecrets(env: Record<string, string> = {}) {
        const secrets = this.ymlConfig.secrets || {};
        function isSecret(value: string): boolean {
            return Object.values(secrets).includes(value);
        }

        return Object.entries(env).filter(([_, value]) => isSecret(value)).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }

    private mapEnv(env: Record<string, string> = {}) {
        const secrets = this.ymlConfig.secrets || {};
        function isSecret(value: string): boolean {
            return Object.values(secrets).includes(value);
        }

        return Object.entries(env).filter(([_, value]) => !isSecret(value)).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }

    private mapPorts(ports: Record<string, Port> = {}): NamedPort[] {
        return Object.entries(ports || {}).map(([name, port]) => ({ ...port, name }));
    }

    public renderDependencyInclude(include: ComponentInclude, key: string) {
        const {components} = YamlRenderer.fromFile(include.include, dependencyFileSchema)
            .with({
                args: include.args,
                components: include.components
            })
            .withFunction("host", (host: string) => `{{ host('${key}.${host}') }}`)
            .render();
        return Object.entries(components).map(([name, component]) => [key + "." + name, component]);
    }

    public renderScriptInclude(include: ScriptInclude) {
        const {title, script} = YamlRenderer.fromFile(include.include, scriptFileSchema)
            .with({ args: include.args })
            .render();
        return {title, script};
    }

    private renderYaml(yaml: any) {
        return YamlRenderer.fromObject(yaml)
          .with({ env: process.env })
          .withFunction("randomPassword", this.randomPassword)
          .withFunction("host", this.host.bind(this))
          .preRenderOrFail("secrets")
          .renderOrFail();
    }


    public randomPassword = (length: number = 32) => (path: string) => {
        const key = path.replace("secrets.", "");
        if(key in this.existingSecrets) {
            return this.existingSecrets[key];
        }
        const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    }

    public host(host: string) {
        return `${host.replace(".", "-")}.${this.ymlConfig.namespace}.svc.cluster.local`;
    }
}