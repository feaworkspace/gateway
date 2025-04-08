import {redirect} from "@solidjs/router";
import type {FetchEvent} from "@solidjs/start/server";
import AuthService from "~/backend/services/AuthService";

export const HOSTNAME = process.env["HOSTNAME"] ?? "localhost";

const REDIRECT = (event: FetchEvent) => {
  let protocol = (event.request.headers.get("X-Forwarded-Proto") + ":") || new URL(event.request.url).protocol || "http:";

  return redirect(protocol + "//" + HOSTNAME + "/login?redirect=" + encodeURIComponent(event.request.url), 301);
}
const UNAUTHORIZED = (_: FetchEvent) => new Response("Unauthorized", {status: 401});

const PRIVATE_ROUTES: Map<string, (event: FetchEvent) => Response> = new Map([
  ["/", REDIRECT],
  ["/api/config", UNAUTHORIZED]
]);

export default function handleAuthentication(event: FetchEvent) {
  const {pathname} = new URL(event.request.url);
  const response = PRIVATE_ROUTES.get(pathname);
  if (!response) {
    return;
  }
  const user = AuthService.get().getUserForEvent(event);
  if (!user) {
    return response(event);
  }
}