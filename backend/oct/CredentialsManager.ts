import * as jose from 'jose';
import { OCT_JWT_PRIVATE_KEY } from '../Settings';
import User from '../types/User';

class CredentialsManager {
    protected getJwtPrivateKey(): Uint8Array {
        const key = OCT_JWT_PRIVATE_KEY;
        if (!key) {
            throw new Error("OCT_JWT_PRIVATE_KEY is not set");
        }
        return Buffer.from(key);
    }

    protected async getJwtExpiration(): Promise<string | number | undefined> {
        return undefined;
    }

    async generateJwt(payload: object): Promise<string> {
        const [key, expiration] = await Promise.all([
            this.getJwtPrivateKey(),
            this.getJwtExpiration()
        ]);
        const signJwt = new jose.SignJWT(payload as jose.JWTPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt();
        if (expiration !== undefined) {
            signJwt.setExpirationTime(expiration);
        }
        return signJwt.sign(key);
    }

    async generateUserJwt(userClaim: User): Promise<string> {
        console.log(`Will generate JWT for user [id: ${userClaim.id} | name: ${userClaim.name} | email: ${userClaim.email}]`);
        return await this.generateJwt(userClaim);
    }

    async getUser(token: string): Promise<User | undefined> {
        const user = await this.verifyJwt(token, isUser);
        if (typeof user.id !== 'string' || typeof user.name !== 'string') {
            console.error("User token is not valid");
        }
        return user;
    }

    async verifyJwt<T extends object>(jwt: string, verify: (obj: unknown) => obj is T): Promise<T> {
        const key = this.getJwtPrivateKey();
        const { payload } = await jose.jwtVerify(jwt, key);
        if (verify(payload)) {
            return payload;
        } else {
            throw this.logger.createErrorAndLog('JWT payload is not valid');
        }
    }
}

function isUser(obj: any): obj is User {
    return typeof obj === "object" && typeof obj.id === 'string' && typeof obj.name === 'string'
}

export const credentialsManager = new CredentialsManager();