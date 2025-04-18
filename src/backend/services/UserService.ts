import UserRepository from '../model/user/UserRepository';
import UserModel from '../model/user/UserModel';
import { Singleton, Startup } from 'tydi';

@Singleton
export default class UserService {
    public constructor(private readonly userRepository: UserRepository) {

    }

    private userCache: Array<UserModel> = [];

    @Startup
    public refreshUsers() {
        setInterval(this.updateCache.bind(this), 60000);
        this.updateCache();
    }

    public async updateCache() {
        this.userCache = await this.userRepository.getUsers();
    }

    public async createUser(user: UserModel) {
        await this.userRepository.createUser(user);
        await this.updateCache();
        return user;
    }

    public async activateUser(email: string) {
        const user = this.userRepository.updateUser(email, {
            status: "active"
        });
        await this.updateCache();
        return user;
    }

    public getUsers(): Array<UserModel> {
        return this.userCache;
    }

    public getOrCreateUser(email: string): Promise<UserModel> {
        const cachedUser = this.getUser(email);
        if(cachedUser) return Promise.resolve(cachedUser);

        return this.createUser({ email, role: "user", status: "pending" });
    }

    public getUser(email: string) {
        return this.userCache.find(user => user.email === email);
    }

    public getActiveUsers() {
        return this.userCache.filter(user => user.status === "active");
    }
}