import App from "../App";
import { Request, Response } from "express";
import { getUser } from "../utils/getUser";
import AuthService from "../services/AuthService";
import { TOKEN_NAME } from "../Settings";
import * as Settings from "../Settings";
import { Singleton, Startup } from "tydi";

@Singleton
export default class AuthController {
    public constructor(private readonly app: App, private readonly authService: AuthService) {

    }

    @Startup
    public init() {
        this.app.express.post('/api/auth', this.postAuth.bind(this));
    }

    private async postAuth(req: Request, res: Response) {
        const existingUser = await getUser(req);
        if (existingUser) {
            res.json({ logged: true, user: existingUser });
            return;
        }
    
        try {
            const { token: firebaseToken, userData } = req.body;
    
            const { user, token } = await this.authService.createUserJwt(firebaseToken, userData);
    
            // Set the cookie
            res.cookie(TOKEN_NAME, token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
                domain: !Settings.IS_LOCALHOST && "." + Settings.PARENT_HOSTNAME
            });
    
            res.json(user);
        } catch (e) {
            console.error("Error", e);
            res.status(500).json({ logged: false, error: "Error" });
        }
    }
}