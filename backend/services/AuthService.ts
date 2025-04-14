import { getAuth } from "firebase-admin/auth";
import User from "../types/User";
import { credentialsManager } from "../oct/CredentialsManager";

export default class AuthService {
  private static readonly INSTANCE = new AuthService();
  public static get() {
    return this.INSTANCE;
  }

  public async registerUser(firebaseToken: string, userData: any): Promise<{user: User, token: string}> {
    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    
    const firebaseUser = await getAuth().getUser(decodedToken.uid);
    const authProvider = firebaseUser.providerData[0]?.providerId;

    const id = decodedToken.uid;
    const name = authProvider === "github.com" && userData?.reloadUserInfo?.screenName || "inconnu";
    const email = decodedToken.email || firebaseUser.email || userData.providerData?.[0]?.email

    const user = { id, name, email, authProvider };

    console.log("Register user", user);

    const token = await credentialsManager.generateJwt(user);

    return {user, token};
  }
}
