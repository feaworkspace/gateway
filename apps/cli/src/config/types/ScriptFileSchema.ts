import * as z from 'zod';

export interface ScriptFileYaml {
    version: number;
    title: string;
    args?: Record<string, string>;
    script: string;
}

export const scriptFileSchema = z.object({
    version: z.number(),
    title: z.string(),
    args: z.record(z.string()).optional(),
    script: z.string(),
});