import { Component, componentSchema } from "./ComponentSchema";
import * as z from 'zod';

export interface DependencyFileYaml {
    version: number;
    args?: Record<string, string | null>;
    components: Record<string, Component>;
}

export const dependencyFileSchema = z.object({
    version: z.number(),
    args: z.record(z.string().nullable()).optional(),
    components: z.record(componentSchema),
});