import type { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PORT, ROUTES } from '../Settings';
import fullUrl from '../utils/fullUrl';

const router = ROUTES.reduce((acc, route) => {
    acc[route.host + route.path] = "http://127.0.0.1:" + route.targetPort;
    return acc;
} , {} as Record<string, string>);

const proxy = createProxyMiddleware<Request, Response>({
    target: "http://127.0.0.1:" + PORT,
    changeOrigin: true,
    ws: true,
    router,
});

console.log("Proxy router", router)

export default () => function (req: Request, res: Response, next) {
    if(res.locals.proxy) {
        console.log("PROXYING", fullUrl(req));
        return proxy(req, res, next);
    } else {
        console.log("NOT PROXYING", fullUrl(req));
        next();
    }
}