import UserRepository from '../model/user/UserRepository';
import UserModel from '../model/user/UserModel';
import { Singleton } from 'tydi';

@Singleton
export default class UserService {
    public constructor(private readonly userRepository: UserRepository) {

    }

    public async createUser(email: string, role: "user" | "admin" = "user") {
        return this.userRepository.createUser({
            email,
            role,
            status: "active"
        });

    }

    public async activateUser(email: string) {
        return this.userRepository.updateUser(email, {
            status: "active"
        });
    }

    public async getUsers(): Promise<Array<UserModel>> {
        return this.userRepository.getUsers();
    }

    public async getActiveUsers() {
        return (await this.userRepository.getUsers()).filter(user => user.status === "active");
    }
}