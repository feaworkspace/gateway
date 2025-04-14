import { Request } from "express";
import { credentialsManager } from "../oct/CredentialsManager";
import { TOKEN_NAME } from "../Settings";

export async function getUser(req: Request) {
    const jwt = req.cookies[TOKEN_NAME];
    if(!jwt) {
        return undefined;
    }
    try {
        return await credentialsManager.getUser(jwt);
    } catch(e) {
        return undefined;
    }
}
