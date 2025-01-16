import SBMongoDb from "@/lib/data-access/SBMongoDb";
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import IDbUserDto from "@/models/db/IDbUserDto";

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

    async createUser(login: string, email: string, ph: string): Promise<IDbUserDto | null> {
        const db = new SBMongoDb();

        await db.insertOne("users", {
            createdOn: new Date(),
            createdBy: "SYSTEM",
            updatedOn: new Date(),
            updatedBy: "SYSTEM",

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