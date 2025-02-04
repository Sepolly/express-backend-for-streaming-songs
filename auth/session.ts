import { jwtVerify, SignJWT } from "jose";
import '../loadenv';


const jwtSecret = process.env.JWT_SECRET;

if(!jwtSecret) throw new Error("JWT SECRET must be set in the environment variables");
const encodedSecret = new TextEncoder().encode(jwtSecret);

export async function encrypt(payload: {userId: string, expiresAt: Date}): Promise<string>{

    return new SignJWT(payload)
                .setProtectedHeader({alg: 'HS256'})
                .setIssuedAt()
                .setExpirationTime('1d')
                .sign(encodedSecret)

}

export async function decrypt(token: string){
    try {
        const decoded = await jwtVerify(token, encodedSecret);
        return decoded;
    } catch (error) {
        console.error("Error decrypting token:", error);
        throw new Error("Invalid token");
    }  
}

export async function createSession(userId: string): Promise<string>{

    const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours
    const sessionToken = await encrypt({ userId, expiresAt });
    
    return sessionToken as string;

}

export async function verifySession(sessionToken: string): Promise<boolean>{
    try {
        const decoded = await decrypt(sessionToken);
        if(!decoded){
            return false;
        }
        if(!decoded.payload){
            return false;
        }
        const now = new Date();
        return decoded.payload.exp > now.getTime() / 1000;
    } catch (error) {
        return false;
    }
}

export async function refreshToken(sessionToken: string){

    const decoded = await decrypt(sessionToken);
    if(!decoded){
        return null;
    }
    const userId = decoded.payload.userId as string;
    
    return createSession(userId);
}

export async function getCurrentUserId(sessionToken: string){
    if(!(await verifySession(sessionToken))){
        return null;
    }
    
    const decoded = await decrypt(sessionToken);
    const {payload} = decoded;
    return payload.userId;
}
