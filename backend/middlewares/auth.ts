import { Request, Response } from "express";
import { HOSTNAME, ROUTES } from "../Settings";
import fullUrl from "../utils/fullUrl";
import { getUser } from "../utils/getUser";

export default () => function (req: Request, res: Response, next) {
    if(req.get("host") === HOSTNAME) {
        res.locals.proxy = false;
        next();
        return;
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const url = fullUrl(req);

    console.log("Auth middleware", url);
    const { host, pathname } = new URL(url);

    const targetRoute = ROUTES.find(route => route.host === host && pathname.startsWith(route.path));
    if (!targetRoute) {
        console.log("No route found for", url);
        res.status(404).send("No route found for " + url);
        return;
    }

    const user = getUser(req);
    if (targetRoute.auth && !user) {
        res.redirect(protocol + "://" + HOSTNAME + "/login?redirect=" + encodeURIComponent(url));
        return;
    }

    res.locals.proxy = true;
    next();
}