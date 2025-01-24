import SBMongoDb from "@/lib/data-access/SBMongoDb";
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import IDbUserDto from "@/models/db/IDbUserDto";
import {ObjectId} from "mongodb";

export default class MongoUserRepository implements IUserRepository {
    async init(): Promise<void> {
    }

    async ping(): Promise<void> {
        const db = new SBMongoDb();
        await db.ping();
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<IDbUserDto | null> {
        const db = new SBMongoDb();

        const dbUser = await db.findOne("users", { $or: [ { loginKey: loginOrEmail }, { email: loginOrEmail }] });
        if (!dbUser) {
            return null;
        }

        return {
            id: dbUser._id.toString(),
            version: dbUser.version ?? 1,

            createdOn: dbUser.createdOn,
            createdBy: dbUser.createdBy,
            updatedOn: dbUser.updatedOn,
            updatedBy: dbUser.updatedBy,

            login: dbUser.login,
            loginKey: dbUser.loginKey,
            email: dbUser.email,
            ph: dbUser.ph
        };
    }

    async getUserById(id: string): Promise<IDbUserDto | null> {
        const db = new SBMongoDb();

        const dbUser = await db.findOne("users", { _id: new ObjectId(id) });
        if (!dbUser) {
            return null;
        }

        return {
            id: dbUser._id.toString(),
            version: dbUser.version ?? 1,

            createdOn: dbUser.createdOn,
            createdBy: dbUser.createdBy,
            updatedOn: dbUser.updatedOn,
            updatedBy: dbUser.updatedBy,

            login: dbUser.login,
            loginKey: dbUser.loginKey,
            email: dbUser.email,
            ph: dbUser.ph
        };
    }

    async createUser(
        operator: string,
        login: string,
        email: string,
        ph: string): Promise<IDbUserDto | null> {
        const db = new SBMongoDb();

        await db.insertOne("users", {
            createdOn: new Date(),
            createdBy: operator ?? "UNKNOWN",
            updatedOn: new Date(),
            updatedBy: operator ?? "UNKNOWN",
            version: 1,

            login: login,
            loginKey: login.toLowerCase(),
            email: email.toLowerCase(),
            ph: ph
        });

        const result = await db.findOne("users", { loginKey: login.toLowerCase() });

        if (!result || result.email !== email.toLowerCase()) {
            throw new Error("User create unexpectedly failed");
        }

        return {
            id: result._id.toString(),
            version: result.version ?? 1,

            createdOn: result.createdOn,
            createdBy: result.createdBy,
            updatedOn: result.updatedOn,
            updatedBy: result.updatedBy,

            login: result.login,
            loginKey: result.loginKey,
            email: result.email,
            ph: result.ph
        }
    }
}