import IAuthService from "@/lib/services/IAuthService";
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import { createSecretKey } from "node:crypto";
import * as bcrypt from 'bcrypt';
import {jwtVerify, SignJWT} from "jose";
import AuthError, {AuthErrorType} from "@/lib/errors/AuthError";

if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined');
}

const PROUNDS = 10;

const JWT_EXPIRES_IN_DAYS = 5;

const FORBIDDEN_LOGINS = [
    'admin',
    'administrator',
    'root'
];

export default class AuthService implements IAuthService {
    private _userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this._userRepository = userRepository;
    }

    async authenticateUser(login: string, password: string): Promise<{ token: string; validTo: Date; }> {
        const dbUser = await this._userRepository.getUserByLoginOrEmail(login.toLowerCase());
        if (dbUser === null || dbUser === undefined) {
            throw new AuthError('User not found', AuthErrorType.UserNotFound);
        }

        const ok = await bcrypt.compare(password, dbUser.ph);
        if (!ok) {
            throw new AuthError('Password does not match', AuthErrorType.WrongPassword);
        }

        const token = await this.generateUserToken(dbUser.id, dbUser.login);

        return token;
    }

    async generateUserToken(id: string, login: string) {
        const key = createSecretKey(process.env.JWT_SECRET!, 'utf8');

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + JWT_EXPIRES_IN_DAYS);

        const token = await new SignJWT({
            id: id,
            login: login
        })
            .setProtectedHeader({
                alg: 'HS256'
            }) // algorithm
            .setIssuedAt()
            //.setIssuer(process.env.JWT_ISSUER) // issuer
            //.setAudience(process.env.JWT_AUDIENCE) // audience
            //.setExpirationTime("7 d") // token expiration time, e.g., "1 day"
            .setExpirationTime(expirationDate)
            .sign(key); // secretKey generated from previous step

        return {
            token: token,
            validTo: expirationDate
        };
    }

    async registerUser(login: string, password: string, email: string): Promise<{ success: boolean; errorMessage?: string; }> {
        if (FORBIDDEN_LOGINS.includes(login.toLowerCase())) {
            return {
                success: false,
                errorMessage: 'Login is forbidden'
            };
        }

        let existingUser = await this._userRepository.getUserByLoginOrEmail(login.toLowerCase());
        if (existingUser !== null) {
            return {
                success: false,
                errorMessage: 'User already exists'
            };
        }

        existingUser = await this._userRepository.getUserByLoginOrEmail(email.toLowerCase());
        if (existingUser !== null) {
            return {
                success: false,
                errorMessage: 'User already exists'
            };
        }

        const ph = await bcrypt.hash(password, PROUNDS);

        try {
            await this._userRepository.createUser(login, login, email, ph);
        } catch (error) {
            return {
                success: false,
                errorMessage: (error as { message: string })?.message ?? 'Unknown error'
            }
        }

        return {
            success: true
        };
    }

    async getUserFromToken(token: string): Promise<{ id: string; login: string; }> {
        const key = createSecretKey(process.env.JWT_SECRET!, 'utf8');

        try {
            const res = await jwtVerify(token, key, {
                audience: undefined,
                issuer: undefined,
                algorithms: ['HS256']
            });

            if (!res.payload.id || !res.payload.login) {
                throw new AuthError('Invalid token', AuthErrorType.InvalidToken);
            }

            return {
                id: res.payload.id as string,
                login: res.payload.login as string
            }
        } catch (e) {
            if (e instanceof AuthError) {
                throw e;
            }

            throw new AuthError('Token verification fail', AuthErrorType.InvalidToken);
        }
    }
}