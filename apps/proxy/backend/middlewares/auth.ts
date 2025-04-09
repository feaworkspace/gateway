import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { HOSTNAME, ROUTES } from "../Settings";
import fullUrl from "../utils/fullUrl";

export default () => function (req: Request, res: Response, next) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const url = fullUrl(req);

    console.log("Auth middleware", url);
    const { host, pathname } = new URL(url);

    const targetRoute = ROUTES.find(route => route.host === host && pathname.startsWith(route.path));
    if (!targetRoute) {
        console.log("No route found for", url);
        res.locals.proxy = false;
        next();
        return;
    }

    const user = AuthService.get().getUserForRequest(req);
    if (targetRoute.auth && !user) {
        if(url.startsWith(protocol + "://" + HOSTNAME + "/login")
            || url.startsWith(protocol + "://" + HOSTNAME + "/api/auth")) {
            res.locals.proxy = false;
            next();
        } else {
            res.redirect(protocol + "://" + HOSTNAME + "/login?redirect=" + encodeURIComponent(url));
        }
        return;
    }

    res.locals.proxy = true;
    next();
}