import { ConnectionProvider, SocketIoTransportProvider } from 'open-collaboration-protocol';
import { credentialsManager } from './CredentialsManager';
import OctRoomInstance from './OctRoomInstance';

class OctClient {
    private authHandler: ConnectionProvider;

    public onReady: () => void = () => { };

    public constructor() {
        this.init();
    }

    public async init() {
        const systemToken = await credentialsManager.generateUserJwt(
            {
                id: "system",
                name: "System",
                email: "system@workspace.com",
                authProvider: "system",
            }
        );

        console.log("[OCT] System JWT", systemToken);

        this.authHandler = new ConnectionProvider({
            url: "http://127.0.0.1:8100",
            client: "gateway",
            fetch: fetch,
            opener: url => console.log("[OCT] Open URL", url),
            transports: [SocketIoTransportProvider],
            userToken: systemToken // TODO localStorage.getItem(COLLABORATION_AUTH_TOKEN) ?? undefined
        });

        this.onReady();
    }

    public async createRoom() {
        const roomClaim = await this.authHandler.createRoom({
            reporter: info => console.log("[OCT]", info),
            // abortSignal: tokens => console.log("[OCT] Room creation aborted", tokens),
        });
        console.log("[OCT] Room created", roomClaim);

        const connection = await this.authHandler.connect(roomClaim.roomToken);

        return await OctRoomInstance.fromConnection(connection);

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
}

export const octClient = new OctClient();