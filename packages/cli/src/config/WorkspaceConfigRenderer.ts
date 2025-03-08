import * as fs from 'fs';
import * as yaml from 'yaml';
import { DependencyInclude, ScriptInclude, workspaceSchema, WorkspaceFileYaml } from './types/WorkspaceFileSchema';
import { dependencyFileSchema } from './types/DependencyFileSchema';
import { scriptFileSchema } from './types/ScriptFileSchema';
import YamlRenderer from './YamlRenderer';
import {map, toArray} from "../utils/ObjectUtils";
import {componentToWorkspaceComponent, WorkspaceConfig} from "./types/WorkspaceConfig";

export default class WorkspaceConfigRenderer {
    private ymlConfig: WorkspaceFileYaml;

    public constructor(workspaceFile: string) {
        const workspaceYml = fs.readFileSync(workspaceFile, 'utf8');
        this.ymlConfig = yaml.parse(workspaceYml);
    }

    public render() {
        this.ymlConfig = workspaceSchema.parse(this.ymlConfig);
        this.ymlConfig.app.initScripts = this.ymlConfig.app.initScripts.map((script) => "include" in script ? this.renderScriptInclude(script) : script);
        this.ymlConfig.dependencies = Object.fromEntries(Object.entries(this.ymlConfig.dependencies).flatMap(([key, value]) => "include" in value ? this.renderDependencyInclude(value, key) : [[key, value]]));

        const renderedConfig = YamlRenderer.fromObject(this.ymlConfig)
            .with({ env: process.env })
            .withFunction("randomPassword", this.randomPassword)
            .withFunction("host", this.host)
            .excludeFromEvaluation("secrets.*")
            .preRenderOrFail("secrets")
            .renderOrFail();

        const config: WorkspaceConfig = {
            version: this.ymlConfig.version,
            namespace: this.ymlConfig.namespace,
            domain: this.ymlConfig.domain,
            subdomainFormat: this.ymlConfig.subdomainFormat,
            repositories: this.ymlConfig.repositories,
            nodeSelector: this.ymlConfig.nodeSelector,
            components: [{...renderedConfig.app, name: "app"}, ...toArray(renderedConfig.dependencies, 'name')].map((component) => componentToWorkspaceComponent(component, component.name, this.ymlConfig.namespace)),
            secrets: this.ymlConfig.secrets,
        }

        return config;
    }

    public renderDependencyInclude(include: DependencyInclude, key: string) {
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


    public randomPassword = (length: number = 32) => (path: string) => {
        // TODO reuse existing password from secrets if it exists
        const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        console.log("Generating random password for", path);
        return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    }

    public host = (host: string) => (path: string) => {
        return `${host.replace(".", "-")}.${this.ymlConfig.namespace}.svc.cluster.local`;
    }
}