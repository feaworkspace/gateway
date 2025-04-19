import { RouteConfig } from "./domain/route/RouteConfig";

export const PORT = parseInt(process.env["PORT"] ?? "3001");
export const HOSTNAME = process.env["HOSTNAME"] ?? "localhost"+":"+PORT;
export const THEIA_HOSTNAME = process.env["THEIA_HOSTNAME"] ?? "localhost"+":"+3000;
export const PARENT_HOSTNAME = HOSTNAME.substring(HOSTNAME.indexOf(".") + 1);
export const IS_LOCALHOST = !process.env["HOSTNAME"];
export const TOKEN_NAME = process.env["TOKEN_NAME"] ?? "workspace-token";
export const ROUTES = (JSON.parse(process.env["ROUTES"] || "[]") as RouteConfig[]).sort((a, b) => {
    if (a.host === b.host) {
      return b.path.length - a.path.length;
    }
    return b.host.length - a.host.length;
  });
export const WORKSPACE_NAME = process.env["WORKSPACE_NAME"] ?? "local";
export const OCT_JWT_PRIVATE_KEY = process.env.OCT_JWT_PRIVATE_KEY;
export const PROTOCOL = IS_LOCALHOST ? "http" : "https";
export const CORS_ALLOWED_ORIGINS = [PROTOCOL + "://" + HOSTNAME, PROTOCOL + "://" + THEIA_HOSTNAME];
export const OCT_SERVER_URL = process.env["OCT_SERVER_URL"] ?? "http://127.0.0.1:8100";