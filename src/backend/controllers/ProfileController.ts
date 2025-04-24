import App from "../App";
import { Request, Response } from "express";
import { getUser } from "../utils/getUser";
import { Singleton, Startup } from "tydi";

@Singleton
export default class ProfileController {
    public constructor(private readonly app: App) {

    }

    @Startup
    public init() {
        this.app.express.get('/api/profile', this.getProfile.bind(this));
    }

    private async getProfile(req: Request, res: Response) {
        const user = await getUser(req);
        if (user) {
            res.json(user);
            return;
        } else {
            res.json({ error: "Not authenticated." });
            return;
        }
    }
}