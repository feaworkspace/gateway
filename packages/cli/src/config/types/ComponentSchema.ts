import * as z from 'zod';

export interface Component {
    image: string;
    ports?: Record<string, Port>;
    env?: Record<string, string>;
    volumes?: Record<string, Volume>;
}

export interface Port {
    number: number;
    protocol?: string;
    ingress?: Ingress | null;
}

export interface Ingress {
    subdomain?: string;
    path?: string;
}

export interface Volume {
    size: string;
    mountPath: string;
}

export const componentSchema = z.object({
    image: z.string(),
    ports: z.record(z.object({
        number: z.number(),
        protocol: z.string().optional(),
        ingress: z.object({
            subdomain: z.string().optional(),
            path: z.string().optional(),
        }).optional().nullable(),
    })).optional(),
    env: z.record(z.any()).optional(),
    volumes: z.record(z.object({
        size: z.string(),
        mountPath: z.string(),
    })).optional(),
});
