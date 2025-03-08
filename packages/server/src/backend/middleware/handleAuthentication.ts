import {getCookie} from "vinxi/http";
import {redirect} from "@solidjs/router";
import type {FetchEvent} from "@solidjs/start/server";
import AuthService from "~/backend/services/AuthService";

const REDIRECT = () => redirect("/login", 301);
const UNAUTHORIZED = () => new Response("Unauthorized", {status: 401});

const PRIVATE_ROUTES: Map<string, () => Response> = new Map([
  ["/", REDIRECT],
  ["/api/config", UNAUTHORIZED]
]);

export default function handleAuthentication(event: FetchEvent) {
  const {pathname} = new URL(event.request.url);
  const response = PRIVATE_ROUTES.get(pathname);
  if (!response) {
    return;
  }
  const token = getCookie(event.nativeEvent, "token");
  if (!token) {
    return response();
  }
  const user = AuthService.get().getUser(token);
  if (!user) {
    return response();
  }
}