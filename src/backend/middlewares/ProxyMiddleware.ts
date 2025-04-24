import type { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { DEBUG, PORT, ROUTES } from '../Settings';
import fullUrl from '../utils/fullUrl';
import App from '../App';
import { Priority, Singleton, Startup } from 'tydi';

@Singleton
export default class ProxyMiddleware {
    private router = ROUTES.reduce((acc, route) => {
        acc[route.host + route.path] = "http://127.0.0.1:" + route.targetPort;
        return acc;
    } , {} as Record<string, string>);

    private proxy = createProxyMiddleware<Request, Response>({
        target: "http://127.0.0.1:" + PORT,
        changeOrigin: true,
        ws: true,
        router: this.router,
    });

    public constructor(private readonly app: App) {
        console.log("Proxy router", this.router)
    }

    @Startup
    @Priority(99)
    public init() {
        this.app.express.use(this.handleProxy.bind(this));
    }

    private async handleProxy(req: Request, res: Response, next) {
        if(res.locals.proxy) {
            DEBUG && console.log("PROXYING", fullUrl(req));
            return this.proxy(req, res, next);
        } else {
            DEBUG && console.log("NOT PROXYING", fullUrl(req));
            next();
        }

    }
}
