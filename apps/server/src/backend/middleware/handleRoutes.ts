import type { FetchEvent } from "@solidjs/start/server";
import { H3Error, proxyRequest } from "vinxi/http";
import AuthService from "~/backend/services/AuthService";

interface RouteConfig {
  host: string;
  path: string;
  auth: boolean;
  targetPort: number;
}

const ROUTES = (JSON.parse(process.env["ROUTES"] || "[]") as RouteConfig[]).sort((a, b) => {
  if (a.host === b.host) {
    return a.path.length - b.path.length;
  }
  return a.host.localeCompare(b.host);
});

// TODO
const ALLOWED_USERS = (JSON.parse(process.env["ALLOWED_USERS"] || "[]") as string[]).sort((a, b) => a.localeCompare(b));

export default async function handleRoutes(event: FetchEvent) {
  const url = event.request.url;
  const { host, pathname } = new URL(url);

  const targetRoute = ROUTES.find(route => route.host === host && pathname.startsWith(route.path));
  if (!targetRoute) {
    return new Response("Not Found", { status: 404 });
  }

  const user = AuthService.get().getUserForEvent(event);
  if (targetRoute.auth && !user) {
    return;
  }

  return new Promise<Response>((resolve, reject) => {
    proxyRequest(event.nativeEvent, `http://localhost:${targetRoute.targetPort}${pathname}`, {
      onResponse(_, response) {
        resolve(response);   
      }
    }).catch((err: H3Error) => {
      console.error(err);
      reject(new Response(err.message, { status: err.statusCode || 500 }));
    });
  });

}