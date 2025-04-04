import * as z from 'zod';
import { Component, componentSchema } from "./ComponentSchema";

export interface WorkspaceFileYaml {
  version: number;
  namespace: string;
  domain: string;
  subdomainFormat: string;
  users: string[];
  firebaseServiceAccountKey: string;
  nodeSelector?: Record<string, string>;
  repositories: Repository[];
  secrets?: Record<string, string>;
  app: App;
  dependencies: Record<string, Dependency | DependencyInclude>;
}

export interface Repository {
  url: string;
  name?: string;
  branch?: string;
}

export interface App extends Omit<Component, "image"> {
  image?: string;
  initScripts: Array<Script | ScriptInclude>;
}

export interface Script {
  title: string;
  script: string;
}

export type ScriptInclude = {
  include: string;
  args?: Record<string, string>;
};

export interface Dependency extends Component {
  image: string;
}

export type DependencyInclude = {
  include: string;
  args?: Record<string, string>;
  components?: Record<string, any>;
};

const appSchema = componentSchema.extend({
  image: z.string().optional(),
  initScripts: z.array(z.object({
    include: z.string(),
    args: z.record(z.string()).optional(),
  })),
});

export const workspaceSchema = z.object({
  version: z.number(),
  namespace: z.string(),
  domain: z.string(),
  subdomainFormat: z.string(),
  users: z.array(z.string()),
  nodeSelector: z.record(z.string()).optional(),
  firebaseServiceAccountKey: z.string(),
  repositories: z.array(z.object({
    url: z.string(),
    name: z.string().optional(),
    branch: z.string().optional(),
  })),
  secrets: z.record(z.string()).optional(),
  app: appSchema,
  dependencies: z.record(z.union([componentSchema, z.object({
    include: z.string(),
    args: z.record(z.string()).optional(),
    components: z.record(z.any()).optional(),
  })])),
});
