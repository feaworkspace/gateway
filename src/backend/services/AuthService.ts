import { getAuth } from "firebase-admin/auth";
import JwtService from "./JwtService";
import AuthUser from "../domain/auth/AuthUser";
import { Singleton } from "tydi";
import UserService from "./UserService";

@Singleton
export default class AuthService {

  public constructor(private readonly jwtService: JwtService, private readonly userService: UserService) { }

  public async getUserFromJwt(token: string): Promise<AuthUser | undefined> {
    const user = await this.jwtService.verifyJwt(token, isUser);
    if (typeof user.id !== 'string' || typeof user.name !== 'string') {
      console.error("User token is not valid");
      return;
    }
    return user;
  }

  public async createUserJwt(firebaseToken: string, userData: any): Promise<{ user: AuthUser, token: string } | undefined> {
    const decodedToken = await getAuth().verifyIdToken(firebaseToken);

    const firebaseUser = await getAuth().getUser(decodedToken.uid);
    const authProvider = firebaseUser.providerData[0]?.providerId;

    const id = decodedToken.uid;
    const name = authProvider === "github.com" && userData?.reloadUserInfo?.screenName || "inconnu";
    const email = decodedToken.email || firebaseUser.email || userData.providerData?.[0]?.email

    const userModel = await this.userService.getOrCreateUser(email);
    if (userModel?.status !== "active") {
      console.error("User " + email + " is not active.");
      return;
    }

    const user = { id, name, email, authProvider };
    console.log("Create user JWT", user.id);

    const token = await this.jwtService.createJwt(user);

    return { user, token };
  }
}

function isUser(obj: any): obj is AuthUser {
  return typeof obj === "object" && typeof obj.id === 'string' && typeof obj.name === 'string'
}