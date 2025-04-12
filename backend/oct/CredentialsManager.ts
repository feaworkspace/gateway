import * as jose from 'jose';
import { OCT_JWT_PRIVATE_KEY } from '../Settings';
import { User } from 'open-collaboration-protocol';

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

    async generateUserJwt(userClaim: User & {id: string}): Promise<string> {
        console.log(`Will generate JWT for user [id: ${userClaim.id} | name: ${userClaim.name} | email: ${userClaim.email}]`);
        return await this.generateJwt(userClaim);
    }
}

export const credentialsManager = new CredentialsManager();