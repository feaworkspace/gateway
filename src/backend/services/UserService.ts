import UserRepository from '../model/user/UserRepository';
import UserModel from '../model/user/UserModel';
import { Singleton, Startup } from 'tydi';

@Singleton
export default class UserService {
    public constructor(private readonly userRepository: UserRepository) {

    }

    public async createUser(user: UserModel) {
        await this.userRepository.createUser(user);
        return user;
    }

    public async activateUser(email: string) {
        const user = this.userRepository.updateUser(email, {
            status: "active"
        });
        return user;
    }

    public async getUsers(): Promise<Array<UserModel>> {
        return this.userRepository.getUsers();
    }

    public async getOrCreateUser(email: string): Promise<UserModel> {
        const cachedUser = await this.getUser(email);
        if(cachedUser) return Promise.resolve(cachedUser);

        return this.createUser({ email, role: "user", status: "pending" });
    }

    public async getUser(email: string) {
        return (await this.getUsers()).find(user => user.email === email);
    }

    public async getActiveUsers() {
        return (await this.getUsers()).filter(user => user.status === "active");
    }
}