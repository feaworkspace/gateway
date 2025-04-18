import { ConnectionProvider, Deferred, SocketIoTransportProvider } from 'open-collaboration-protocol';
import CollaborationRoom from '../domain/collaboration/CollaborationRoom';
import { OCT_SERVER_URL } from '../Settings';
import JwtService from './JwtService';
import { Singleton, Startup } from 'tydi';

@Singleton
export default class CollaborationService {
    public constructor(private readonly jwtService: JwtService) {}

    private authHandler: ConnectionProvider;

    private room: Deferred<CollaborationRoom> = new Deferred();

    @Startup
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
        room.onDisconnect = this.onRoomDisconnected.bind(this);
    }

    private async onRoomDisconnected(room: CollaborationRoom) {
        console.log("[Collaboration] Room " + room.id + " disconnected. Recreating one...");

        const newRoom = await this.createRoom();
        this.room.resolve(newRoom);
        newRoom.onDisconnect = this.onRoomDisconnected.bind(this);
    }

    private async createRoom() {
        while(true) {
            try {
                const roomClaim = await this.authHandler.createRoom({
                    reporter: info => console.log("[OCT]", info),
                    // abortSignal: tokens => console.log("[OCT] Room creation aborted", tokens),
                });
                console.log("[OCT] Room created", roomClaim);

                const connection = await this.authHandler.connect(roomClaim.roomToken);

                return await CollaborationRoom.fromConnection(connection, roomClaim.roomId);
            }catch(e) {
                console.warn("Open Collaboration Server not available. Retrying in 10 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }
        }

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