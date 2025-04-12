import { RouteConfig } from "./types/RouteConfig";

export const PORT = parseInt(process.env["PORT"] ?? "3000");
export const HOSTNAME = process.env["HOSTNAME"] ?? "localhost"+":"+PORT;
export const PARENT_HOSTNAME = HOSTNAME.substring(HOSTNAME.indexOf(".") + 1);
export const IS_LOCALHOST = !process.env["HOSTNAME"];
export const TOKEN_NAME = process.env["TOKEN_NAME"] ?? "workspace-token";
export const ROUTES = (JSON.parse(process.env["ROUTES"] || "[]") as RouteConfig[]).sort((a, b) => {
    if (a.host === b.host) {
      return b.path.length - a.path.length;
    }
    return b.host.length - a.host.length;
  });
export const WORKSPACE_NAME = process.env["WORKSPACE_NAME"] ?? "workspace";
export const OCT_JWT_PRIVATE_KEY = process.env.OCT_JWT_PRIVATE_KEY