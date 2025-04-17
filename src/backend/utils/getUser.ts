import { Request } from "express";
import { TOKEN_NAME } from "../Settings";
import { Dependencies } from "tydi";
import AuthService from "../services/AuthService";

export async function getUser(req: Request) {
    const jwt = req.cookies[TOKEN_NAME];
    if(!jwt) {
        return undefined;
    }
    try {
        return await Dependencies.get<AuthService>(AuthService.name).getUserFromJwt(jwt);
    } catch(e) {
        return undefined;
    }
}
