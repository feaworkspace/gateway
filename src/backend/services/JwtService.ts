import * as jose from 'jose';
import { OCT_JWT_PRIVATE_KEY } from '../Settings';
import { Singleton } from 'tydi';

@Singleton
export default class JwtService {
    private getJwtPrivateKey(): Uint8Array {
        const key = OCT_JWT_PRIVATE_KEY;
        if (!key) {
            throw new Error("OCT_JWT_PRIVATE_KEY is not set");
        }
        return Buffer.from(key);
    }

    protected async getJwtExpiration(): Promise<string | number | undefined> {
        return undefined;
    }

    public async createJwt(payload: object): Promise<string> {
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

    public async verifyJwt<T extends object>(jwt: string, verify: (obj: unknown) => obj is T): Promise<T> {
        const key = this.getJwtPrivateKey();
        const { payload } = await jose.jwtVerify(jwt, key);
        if (verify(payload)) {
            return payload;
        } else {
            throw console.error('JWT payload is not valid');
        }
    }
}
