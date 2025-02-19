import * as fs from 'fs';
import * as yaml from 'yaml';
import { DependencyInclude, ScriptInclude, workspaceSchema, WorkspaceFileYaml } from './types/WorkspaceFileSchema';
import { dependencyFileSchema } from './types/DependencyFileSchema';
import { scriptFileSchema } from './types/ScriptFileSchema';
import YamlRenderer from './YamlRenderer';
import {map, toArray} from "../utils/ObjectUtils";
import {WorkspaceConfig} from "./types/WorkspaceConfig";

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
            .with({
                env: process.env
            })
            .withFunction("randomPassword", (length: number = 32) => {
                const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
            })
            .excludeFromEvaluation("secrets.*")
            .withFunction("host", (host: string) => `${host.replace(".", "-")}.${this.ymlConfig.namespace}.svc.cluster.local`)
            .preRenderOrFail("secrets")
            .renderOrFail();

        const config: WorkspaceConfig = {
            version: this.ymlConfig.version,
            namespace: this.ymlConfig.namespace,
            domain: this.ymlConfig.domain,
            subdomainFormat: this.ymlConfig.subdomainFormat,
            repositories: this.ymlConfig.repositories,
            nodeSelector: this.ymlConfig.nodeSelector,
            app: renderedConfig.app,
            components: toArray(renderedConfig.dependencies, 'name').map((component) => ({...component, ports: toArray(component.ports, 'name')})),
            secrets: this.ymlConfig.secrets,
        }

        console.log(yaml.stringify(config));
        // return this.renderVariables(
        //     this.mergeIncludes(
        //         yamlConfigSchema.parse(this.ymlConfig)
        //     )
        // );
        return config;
    }

    // public mergeIncludes(config: YamlConfig): MergedYamlConfig {
    //     const components = config.components.flatMap((component) => {
    //         if ('include' in component) {
    //             return this.renderInclude(component);
    //         } else {
    //             return component;
    //         }
    //     });
    //     config.components = components;
    //     return config as MergedYamlConfig;
    // }

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

    // public renderInclude(include: Include) {
    //     const includeYml = fs.readFileSync(include.include, 'utf8');
    //     const includeConfig = yaml.parse(includeYml);
    //     let yamlTemplate = yamlTemplateSchema.parse(includeConfig);
    //     const variables = this.objectToVariables(include.override);
    //     if (variables.length > 0) {
    //         this.setVariables(yamlTemplate, variables);
    //     }
    //     return yamlTemplate.components;
    // }

    // public setVariables(context: YamlTemplate, variables: Array<{ name: string, value: any }>) {
    //     for (const variable of variables) {
    //         this.getVariable(variable.name, context).set(variable.value);
    //     }
    // }

    // public renderVariables(object: any, context: YamlTemplate = object) {
    //     if (typeof object === 'string') {
    //         return object.replace(WorkspaceConfigRenderer.VARIABLE_REGEX, (match, variable, _, defaultValue) => {
    //             return process.env[variable] || defaultValue || this.getVariable(variable, context).get() || '';
    //         });
    //     } else if (typeof object === 'object') {
    //         for (const key in object) {
    //             if (typeof object[key] === 'string') {
    //                 object[key] = this.renderVariables(object[key], context);
    //             } else if (typeof object[key] === 'object') {
    //                 object[key] = this.renderVariables(object[key], context);
    //             }
    //         }
    //         return object;
    //     }
    // }

    // private objectToVariables(object: any, prefix: string = '') {
    //     const variables: Array<{ name: string, value: any }> = [];
    //     for (const key in object) {
    //         if (typeof object[key] === 'string') {
    //             variables.push({ name: prefix + key, value: object[key] });
    //         } else if (typeof object[key] === 'object') {
    //             variables.push(...this.objectToVariables(object[key], prefix + key + '.'));
    //         }
    //     }
    //     return variables;
    // }

    // private getVariable(variable: string, context: YamlTemplate) {
    //     const parts = variable.split('.');
    //     const firstPart = parts.shift();
    //     let value = firstPart === 'global' ? context : context.components.find((component) => component.name === firstPart);
    //     let entry = null;
    //     let key = firstPart;
    //     for (const part of parts) {
    //         if (!value) {
    //             key = undefined;
    //             break;
    //         }
    //         // @ts-ignore
    //         if (value[part]) {
    //             entry = value;
    //             key = part;
    //             // @ts-ignore
    //             value = value[part];
    //         } else {
    //             key = undefined;
    //             value = undefined;
    //         }
    //     }
    //     return {
    //         get() {
    //             return value;
    //         },
    //         set(newValue: any) {
    //             if (entry !== null) {
    //                 // @ts-ignore
    //                 entry[key] = newValue;
    //             }
    //         },
    //     };
    // }

}