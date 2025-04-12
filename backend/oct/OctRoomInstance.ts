import { ClientTextSelection, Deferred, FileSystemDirectory, FileType, InitData, Peer, ProtocolBroadcastConnection, VERSION } from "open-collaboration-protocol";
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

    private constructor(private readonly connection: ProtocolBroadcastConnection) { }


    public static async fromConnection(connection: ProtocolBroadcastConnection): Promise<OctRoomInstance> {
        const instance = new OctRoomInstance(connection);
        await instance.init();
        return instance;
    }

    protected async init() {
        this.yjsProvider = new OpenCollaborationYjsProvider(this.connection, this.yjs, this.yjsAwareness);
        this.yjsProvider.connect();

        await this.registerProtocolEvents(this.connection);
        await this.registerFileEvents();

        this.yjsAwareness.on('change', (changes) => {
            console.log(this.yjsAwareness.getStates());
        });
    }

    protected async registerProtocolEvents(connection: ProtocolBroadcastConnection) {
        connection.peer.onJoinRequest(async (_, user) => {
            console.log('[OCT] Peer join request', user.email ? `${user.name} (${user.email})` : user.name);

            // const roots = await this.workspaceService.roots;
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
                    name: "Project", // this.workspaceService.workspace?.name ?? nls.localize('theia/collaboration/collaboration', 'Collaboration'),
                    folders: ["workspace"] // TODO roots.map(e => e.name)
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
            // if (this.fileSystem) {
            //     this.fileSystem.readonly = permissions.readonly;
            // }
        });
        connection.peer.onInfo((_, peer) => {
            console.log('[OCT] Peer info', peer);
            this.yjsAwareness.setLocalStateField('peer', peer.id);
            this.identity.resolve(peer);
        });
        connection.peer.onInit(async (_, data) => {
            console.log('[OCT] Peer init', data);
            // await this.initialize(data);
        });
        console.log("set fs handlers");
    }

    private registerFileEvents() {
        const connection = this.connection;
        connection.fs.onStat(async (_, path) => {
            console.log('[OCT] Stat', path);
            try {
                const stat = await fs.promises.stat(root(path));
                return {
                    type: stat.isDirectory() ? FileType.Directory : FileType.File,
                    mtime: stat.mtime.getTime(),
                    ctime: stat.ctime.getTime(),
                    size: stat.size
                };
            } catch (e) {
                throw new Error('EntryNotFound (FileSystemError)');
            }
        });
        connection.fs.onReaddir(async (_, path) => {
            console.log('[OCT] Read directory', path);
            const files = await fs.promises.readdir(root(path));
            return files.reduce((acc, file) => {
                acc[file] = fs.statSync(fpath.join(root(path), file)).isDirectory() ? FileType.Directory : FileType.File;
                return acc;
            }, {} as FileSystemDirectory);
        });
        connection.fs.onReadFile(async (_, path) => {
            console.log('[OCT] Read file', path);
            return {
                content: await fs.promises.readFile(root(path))
            };
        });
        connection.fs.onDelete(async (_, path) => {
            console.log('[OCT] Delete', path);
            await fs.promises.rm(root(path), { recursive: true, force: true });
        });
        connection.fs.onRename(async (_, oldPath, newPath) => {
            console.log('[OCT] Rename', oldPath, newPath);
            await fs.promises.rename(root(oldPath), root(newPath));
        });
        connection.fs.onMkdir(async (_, path) => {
            console.log('[OCT] Mkdir', path);
            await fs.promises.mkdir(root(path), { recursive: true });
        });
        connection.fs.onWriteFile(async (_, path, content) => {
            console.log('[OCT] Write file', path, content);
            await fs.promises.writeFile(root(path), content.content);
        });
        connection.fs.onChange(async (_, changes) => {
            console.error('[OCT] File changes unhandled', changes);
        });
        connection.editor.onOpen(async (_, path) => {
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
    }
}

function root(path: string): string {
    return fpath.join("/", path);
}