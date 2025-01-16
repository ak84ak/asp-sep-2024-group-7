import {CreateIndexesOptions, Filter, IndexSpecification, MongoClient} from "mongodb";

if (process.env.SB_MONGO_URL === undefined) {
    throw new Error('SB_MONGO_URL is not defined');
}
if (process.env.SB_MONGO_DB === undefined) {
    throw new Error('SB_MONGO_DB is not defined');
}
if (process.env.SB_MONGO_USER === undefined) {
    throw new Error('SB_MONGO_USER is not defined');
}
if (process.env.SB_MONGO_PASS === undefined) {
    throw new Error('SB_MONGO_PASS is not defined');
}

const sbDb = process.env.SB_MONGO_DB!;
const username = encodeURIComponent(process.env.SB_MONGO_USER!);
const password = encodeURIComponent(process.env.SB_MONGO_PASS!);
const serverUrl = process.env.SB_MONGO_URL!;
const authMechanism = "DEFAULT";
const connectionUri =
    `mongodb://${username}:${password}@${serverUrl}/${sbDb}?authMechanism=${authMechanism}`;

export default class SBMongoDb {
    async ping() {
        const client = new MongoClient(connectionUri);
        try {
            await client.db(sbDb!).command({ping: 1});
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async findOne(collection: string, filter: Filter<Document>) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await c.findOne(filter as any);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async insertOne(collection: string, entity: unknown) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            return await c.insertOne(entity as Document);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async createIndex(collection: string, index: IndexSpecification, options: CreateIndexesOptions) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            return await c.createIndex(index, options);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }
}