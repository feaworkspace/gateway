import { getAuth } from "firebase-admin/auth";
import type { FetchEvent } from "@solidjs/start/server";
import User from "~/backend/types/User";
import crypto from "node:crypto";
import { getCookie } from "vinxi/http";

export const PARENT_HOSTNAME = process.env["PARENT_HOSTNAME"] ?? "localhost";
export const TOKEN_NAME = process.env["TOKEN_NAME"] ?? "workspace-token";

export default class AuthService {
  private static readonly INSTANCE = new AuthService();
  public static get() {
    return this.INSTANCE;
  }

  private readonly userCache: Map<string, User> = new Map();
  private readonly tokenByUid: Map<string, string> = new Map();

  public async registerUser(firebaseToken: string): Promise<{user: User, token: string}> {
    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const existingToken = this.tokenByUid.get(decodedToken.uid);
    if(existingToken) {
      return {token: existingToken, user: this.userCache.get(existingToken)!};
    }

    const userData = await getAuth().getUser(decodedToken.uid);

    const email = decodedToken.email || userData.email || userData.providerData?.[0]?.email;

    const token = generateToken();

    const user = { uid: decodedToken.uid, email };

    this.userCache.set(token, user);
    this.tokenByUid.set(decodedToken.uid, token);

    return {user, token};
  }

  public getUser(token: string) {
    return this.userCache.get(token);
  }

  public getUserForEvent(event: FetchEvent) {
      const token = getCookie(event.nativeEvent, TOKEN_NAME);
      if (!token) {
        return;
      }
      return AuthService.get().getUser(token);
    }
}

function generateToken() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
}