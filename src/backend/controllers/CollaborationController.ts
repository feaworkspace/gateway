import App from "../App";
import { Request, Response } from "express";
import { getUser } from "../utils/getUser";
import AuthService from "../services/AuthService";
import { TOKEN_NAME } from "../Settings";
import * as Settings from "../Settings";
import CollaborationService from "../services/CollaborationService";
import JwtService from "../services/JwtService";
import { Singleton, Startup } from "tydi";

@Singleton
export default class CollaborationController {
    public constructor(
        private readonly app: App,
        private readonly collaborationService: CollaborationService,
        private readonly jwtService: JwtService
    ) { }

    @Startup
    public init() {
        this.app.express.get('/api/collaboration/room', this.getRoom.bind(this));
    }

    private async initDebug() {
        const room = await this.collaborationService.getRoom();

        console.log("[OCT] Ready");

        const user1Token = await this.jwtService.createJwt({
            id: "user1",
            name: "User 1",
            authProvider: "system",
            email: "user1@workspace.com"
        });

        console.log("[OCT] User 1 JWT", user1Token);

        const user2Token = await this.jwtService.createJwt({
            id: "user2",
            name: "User 2",
            authProvider: "system",
            email: "user1@workspace.com"
        });

        console.log("[OCT] User 2 JWT", user2Token);

        console.log("[Collaboration] Room id", room.id);
    }

    private async getRoom(req: Request, res: Response) {
        const user = await getUser(req);
        const room = await this.collaborationService.getRoom();
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        res.json({
            loginToken: req.cookies[TOKEN_NAME],
            roomId: room!.id
        });
    }
}