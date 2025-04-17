import { Request } from "express";

export default function(req: Request) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const url = protocol + '://' + req.get('host') + req.originalUrl;

    return url;
}