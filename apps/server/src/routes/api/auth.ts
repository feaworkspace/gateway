import {APIEvent} from "@solidjs/start/server";
import {getCookie, setCookie} from "vinxi/http";
import {useFirebaseAdminApp} from "~/hooks/useFirebaseAdminApp";
import AuthService, { PARENT_HOST, TOKEN_NAME } from "~/backend/services/AuthService";

useFirebaseAdminApp();

export async function POST(event: APIEvent) {
  const existingUser = AuthService.get().getUser(getCookie("token") || "");
  if(existingUser) {
    return existingUser;
  }

  const {token: firebaseToken} = await event.request.json();

  const {token, user} = await AuthService.get().registerUser(firebaseToken);
  setCookie(event.nativeEvent, TOKEN_NAME, token, {
    httpOnly: true,
    domain: "." + PARENT_HOST,
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
  return user;
}