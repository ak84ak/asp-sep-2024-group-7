import ISbInitService from "@/lib/services/ISbInitService";
import SBMongoDb from "@/lib/data-access/SBMongoDb";

export default class SbInitService implements ISbInitService {
    async init(): Promise<void> {
        // Create indexes in MongoDB
        const mongoDb = new SBMongoDb();

        await mongoDb.createIndex("users", { "loginKey": 1 }, { unique: true });
        await mongoDb.createIndex("users", { "email": 1 }, { unique: true });
    }
}