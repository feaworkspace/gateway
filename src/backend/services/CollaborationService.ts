import { ConnectionProvider, Deferred, SocketIoTransportProvider } from 'open-collaboration-protocol';
import OctRoomInstance from '../domain/collaboration/OctRoomInstance';
import { OCT_SERVER_URL } from '../Settings';
import JwtService from './JwtService';
import { Singleton } from 'tydi';

@Singleton
export default class CollaborationService {
    public constructor(private readonly jwtService: JwtService) {}

    private authHandler: ConnectionProvider;

    private room: Deferred<OctRoomInstance> = new Deferred();

    public async init() {
        const systemJwt = await this.jwtService.createJwt(
            {
                id: "system",
                name: "System",
                email: "system@workspace.com",
                authProvider: "system",
            }
        );

        console.log("[OCT] System JWT", systemJwt);

        this.authHandler = new ConnectionProvider({
            url: OCT_SERVER_URL,
            client: "system",
            fetch: fetch,
            opener: url => console.log("[OCT] Open URL", url),
            transports: [SocketIoTransportProvider],
            userToken: systemJwt // TODO localStorage.getItem(COLLABORATION_AUTH_TOKEN) ?? undefined
        });

        
        const room = await this.createRoom();
        this.room.resolve(room);
    }

    private async createRoom() {
        const roomClaim = await this.authHandler.createRoom({
            reporter: info => console.log("[OCT]", info),
            // abortSignal: tokens => console.log("[OCT] Room creation aborted", tokens),
        });
        console.log("[OCT] Room created", roomClaim);

        const connection = await this.authHandler.connect(roomClaim.roomToken);

        return await OctRoomInstance.fromConnection(connection, roomClaim.roomId);

        // connection.peer.onJoinRequest = async (peerId, accept) => {
        //     console.log("[OCT] Peer join request", peerId);
        //     const acceptConnection = await accept();
        //     console.log("[OCT] Peer connection accepted", acceptConnection);
        // };
        // this.currentInstance = this.collaborationInstanceFactory({
        //     role: 'host',
        //     connection
        // });
        // const connection = await authHandler.connect(roomClaim.roomToken);
        // this.currentInstance = this.collaborationInstanceFactory({
        //     role: 'host',
        //     connection
        // });
    }

    public getRoom() {
        return this.room.promise
    }
}