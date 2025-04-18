import { getFirestore } from 'firebase-admin/firestore';
import UserModel from './UserModel';
import { Singleton, Startup } from 'tydi';
import { WORKSPACE_NAME } from '../../Settings';

@Singleton
export default class UserRepository {
    private readonly firestore = getFirestore();

    private readonly collection = this.firestore.collection(WORKSPACE_NAME);

    public constructor() {
    }
    
    @Startup
    public async init() {
        const collection = await this.collection.get();
        if(collection.empty) {
            this.collection.doc("test@example.com").create({
                role: "user",
                status: "pending"
            });
        }
    }

    public async createUser(user: UserModel) {
        return this.collection.doc(user.email).create({
            role: user.role,
            status: user.status
        });

    }
    public async updateUser(email: string, user: Partial<UserModel>) {
        return this.collection.doc(email).update({
            role: user.role,
            status: user.status,
        });
    }

    public async getUsers(): Promise<Array<UserModel>> {
        const users = (await this.collection.get()).docs;
        return users.map(doc => ({
            email: doc.id,
            role: doc.data().role ?? "user",
            status: doc.data().status ?? "active"
        }))
    }
}