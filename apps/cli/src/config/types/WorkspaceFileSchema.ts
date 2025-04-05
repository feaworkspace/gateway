import * as z from 'zod';
import { Component, componentSchema, Ingress } from "./ComponentSchema";
import Settings from '../../Settings.json';

export interface WorkspaceFileYaml {
  version: number;
  namespace: string;
  nodeSelector?: Record<string, string>;
  secrets?: Record<string, string>;
  workspace: Workspace;
  server: Server;
  components: Record<string, Component | ComponentInclude>;
}

export interface Repository {
  url: string;
  name?: string;
  branch?: string;
}

export interface Server {
  image: string;
  tag: string;
  users: string[];
  domain: string;
  subdomainFormat: string;
  firebaseServiceAccountKey: string;
  // ingresses: Array<Ingress>;
}

export interface Workspace extends Component {
  image: string;
  tag?: string;
  repositories: Repository[];
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

export type ComponentInclude = {
  include: string;
  args?: Record<string, string>;
  components?: Record<string, any>;
};

const serverSchema = z.object({
  image: z.string().optional().default(Settings.serverImage),
  tag: z.string().optional().default(Settings.tag),
  users: z.array(z.string()),
  domain: z.string(),
  subdomainFormat: z.string(),
  firebaseServiceAccountKey: z.string(),
});

const wsSchema = componentSchema.extend({
  image: z.string().optional().default(Settings.workspaceImage),
  tag: z.string().optional().default(Settings.tag),
  repositories: z.array(z.object({
    url: z.string(),
    name: z.string().optional(),
    branch: z.string().optional(),
  })),
  initScripts: z.array(z.union([
    z.object({
      title: z.string(),
      script: z.string(),
    }),
    z.object({
      include: z.string(),
      args: z.record(z.string()).optional(),
    }),
  ])).optional().default([]),
});

export const workspaceSchema = z.object({
  version: z.number(),
  namespace: z.string(),
  nodeSelector: z.record(z.string()).optional(),
  secrets: z.record(z.string()).optional(),
  workspace: wsSchema,
  server: serverSchema,
  components: z.record(z.union([componentSchema, z.object({
    include: z.string(),
    args: z.record(z.string()).optional(),
    components: z.record(z.any()).optional(),
  })])),
});
