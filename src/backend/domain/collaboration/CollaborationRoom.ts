import { Deferred, InitData, Peer, ProtocolBroadcastConnection, VERSION } from "open-collaboration-protocol";
import { OpenCollaborationYjsProvider } from "open-collaboration-yjs";

import * as fpath from 'path';
import * as fs from 'fs';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import Author from "./Author";

export default class CollaborationRoom {
    protected peers = new Map<string, Peer>();
    private identity: Deferred<Peer> = new Deferred<Peer>();
    private yjsProvider: OpenCollaborationYjsProvider;
    protected yjs = new Y.Doc();
    protected yjsAwareness = new awarenessProtocol.Awareness(this.yjs);
    protected lastWrite: Map<string, number> = new Map();
    public onDisconnect = (room: CollaborationRoom) => { };

    private constructor(private readonly connection: ProtocolBroadcastConnection, public readonly id: string) {
        // @ts-ignore Detect disconnection immediately
        connection.options.transport.socket.on('disconnect', _ => this.onDisconnect(this));
    }

    public static async fromConnection(connection: ProtocolBroadcastConnection, roomId: string): Promise<CollaborationRoom> {
        const instance = new CollaborationRoom(connection, roomId);
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
                permissions: { readonly: false },
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
            console.log('[OCT] Peer info', peer.id, peer.name);
            this.yjsAwareness.setLocalStateField('peer', peer.id);
            this.identity.resolve(peer);
        });
        connection.peer.onInit(async (_, data) => {
            console.log('[OCT] Peer init', data);
        });
    }

    private registerFileEvents() {
        this.connection.editor.onOpen(async (_, path) => {
            console.log('[OCT] Open editor', path);
            const unknownModel = !this.yjs.share.has(path);
            const ytext = this.yjs.getText(path);
            if (unknownModel) {
                const text = await (await fs.promises.readFile(root(path))).toString('utf-8');
                this.yjs.transact(() => {
                    ytext.delete(0, ytext.length);
                    ytext.insert(0, text);
                });
                this.lastWrite.set(path, new Date().getTime());
                fs.watch(root(path)).on("change", async () => {
                    const delta = new Date().getTime() - this.lastWrite.get(path)!;
                    if(delta > 1000) {
                        try {
                            const text = await (await fs.promises.readFile(root(path))).toString('utf-8');
                            this.yjs.transact(() => {
                                ytext.delete(0, ytext.length);
                                ytext.insert(0, text);
                            });
                        }catch(e) {
                            console.error(e);
                        }
                    }
                 });
            }
        });

        this.connection.fs.onWriteFile(async (peer, path, data) => {
            this.lastWrite.set(path, new Date().getTime());

            const author = this.peers.get(peer);
            if (!author) return;

            console.log(author.name, "write file", path);

            path = root(path);

            const repositoryPath = await findGitRepository(path);
            console.log("Found repository", repositoryPath);
            if (!repositoryPath) return;

            await writeCommitMsgHook(repositoryPath);

            const authorsFilePath = fpath.join(repositoryPath, ".git", "authors.json");
            let authors: Array<Author> = [];
            try {
                authors = JSON.parse((await fs.promises.readFile(authorsFilePath)).toString('utf-8'));
            } catch (e) { }
            authors.push({ name: author.name, email: author.email! });
            authors = authors.filter((current, index, arr) => arr.findIndex(e => e.name === current.name && e.email === current.email) === index);

            await fs.promises.writeFile(authorsFilePath, JSON.stringify(authors));
        });
        // Others event are handled by default Theia RemoteFileSystem
    }
}

function root(path: string): string {
    return fpath.join("/", path);
}

async function findGitRepository(path: string): Promise<string | undefined> {
    const stat = await fs.promises.stat(path);
    if (stat.isDirectory()) {
        path = fpath.dirname(path);
    }
    while (path !== fpath.dirname(path)) {
        try {
            const dotGitFile = await fs.promises.stat(fpath.join(path, ".git"));
            if (dotGitFile.isDirectory()) {
                return path;
            }
        } catch (e) {
            // .git not found
            path = fpath.dirname(path);
        }
    }
}

async function writeCommitMsgHook(repositoryPath: string) {
    const commitMsgPath = fpath.resolve(repositoryPath, ".git", "hooks", "commit-msg");
    try {
        await fs.promises.stat(commitMsgPath);
    } catch (e) {
        await fs.promises.writeFile(commitMsgPath, `
#!/bin/sh

set -e

authors=$(jq -c '.[]' .git/authors.json)
echo "" >> $1
for author in $authors; do
	name=$(echo "$author" | jq -c -r '.name')
	email=$(echo "$author" | jq -c -r '.email')
	echo "Co-authored-by: $name <$email>" >> $1
done
`);
        await fs.promises.chmod(commitMsgPath, 0o755);
    }
}