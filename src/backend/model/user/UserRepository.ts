import { getFirestore } from 'firebase-admin/firestore';
import UserModel from './UserModel';
import { Singleton } from 'tydi';

@Singleton
export default class UserRepository {
    private readonly firestore = getFirestore();

    public async createUser(user: UserModel) {
        return this.firestore.collection("test").doc(user.email).create({
            role: user.role,
            status: user.status
        });

    }
    public async updateUser(email: string, user: Partial<UserModel>) {
        return this.firestore.collection("users").doc(email).update({
            role: user.role,
            status: user.status,
        });
    }

    public async getUsers(): Promise<Array<UserModel>> {
        const users = (await this.firestore.collection("test").get()).docs;
        return users.map(doc => ({
            email: doc.id,
            role: doc.data().role ?? "user",
            status: doc.data().status ?? "active"
        }))
    }
}