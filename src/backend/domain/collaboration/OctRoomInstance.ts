import { Deferred, InitData, Peer, ProtocolBroadcastConnection, VERSION } from "open-collaboration-protocol";
import { OpenCollaborationYjsProvider } from "open-collaboration-yjs";

import * as fpath from 'path';
import * as fs from 'fs';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';

export default class OctRoomInstance {
    protected peers = new Map<string, Peer>();
    private identity: Deferred<Peer> = new Deferred<Peer>();
    private yjsProvider: OpenCollaborationYjsProvider;
    protected yjs = new Y.Doc();
    protected yjsAwareness = new awarenessProtocol.Awareness(this.yjs);

    private constructor(private readonly connection: ProtocolBroadcastConnection, public readonly id: string) { }
    
    public static async fromConnection(connection: ProtocolBroadcastConnection, roomId: string): Promise<OctRoomInstance> {
        const instance = new OctRoomInstance(connection, roomId);
        await instance.init();
        return instance;
    }

    protected async init() {
        this.yjsProvider = new OpenCollaborationYjsProvider(this.connection, this.yjs, this.yjsAwareness);
        this.yjsProvider.connect();

        await this.registerProtocolEvents(this.connection);
        await this.registerFileEvents();
        this.initTerminals();
    }
    initTerminals() {
        // initialize shared map
        const yTerminals = this.yjs.getMap<boolean>('terminals');
        this.yjs.transact(() => {
            yTerminals.set("sync", true);
            yTerminals.delete("sync");
        })
    }

    protected async registerProtocolEvents(connection: ProtocolBroadcastConnection) {
        connection.peer.onJoinRequest(async (_, user) => {
            console.log('[OCT] Peer join request', user.email ? `${user.name} (${user.email})` : user.name);
            return {
                workspace: {
                    name: "Project",
                    folders: ["workspace"] // TODO
                }
            };
        });
        connection.room.onJoin(async (_, peer) => {
            this.peers.set(peer.id, peer);
            const data: InitData = {
                protocol: VERSION,
                host: await this.identity.promise,
                guests: Array.from(this.peers.values()),
                capabilities: {},
                permissions: {readonly: false},
                workspace: {
                    name: "Project",
                    folders: ["workspace"]
                }
            };
            connection.peer.init(peer.id, data);
        });
        connection.room.onLeave((_, peer) => {
            this.peers.delete(peer.id);
            console.log('[OCT] Peer left', peer.id);
        });
        connection.room.onClose(() => {
            console.log('[OCT] Room closed');
        });
        connection.room.onPermissions((_, permissions) => {
            console.log('[OCT] Permissions changed', permissions);
        });
        connection.peer.onInfo((_, peer) => {
            console.log('[OCT] Peer info', peer);
            this.yjsAwareness.setLocalStateField('peer', peer.id);
            this.identity.resolve(peer);
        });
        connection.peer.onInit(async (_, data) => {
            console.log('[OCT] Peer init', data);
        });
        console.log("set fs handlers");
    }

    private registerFileEvents() {
        this.connection.editor.onOpen(async (_, path) => {
            console.log('[OCT] Open editor', path);
            const unknownModel = !this.yjs.share.has(path);
            const ytext = this.yjs.getText(path);
            if(unknownModel) {
                const text = await (await fs.promises.readFile(root(path))).toString('utf-8');
                this.yjs.transact(() => {
                    ytext.delete(0, ytext.length);
                    ytext.insert(0, text);
                });
            }
        });

        // Others event are handled by default Theia RemoteFileSystem
    }
}

function root(path: string): string {
    return fpath.join("/", path);
}