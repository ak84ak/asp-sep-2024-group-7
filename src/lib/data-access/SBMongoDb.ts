import {CreateIndexesOptions, Db, Filter, IndexSpecification, MongoClient, UpdateFilter} from "mongodb";

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

    async find(collection: string, filter: Filter<Document>) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await c.find(filter as any).toArray();
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

    async insertMany(collection: string, entities: unknown[]) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            return await c.insertMany(entities as Document[]);
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

    async updateOne(collection: string, filter: Filter<Document>, update: UpdateFilter<Document> | Document[]) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await c.updateOne(filter as any, update as any);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async deleteOne(collection: string, filter?: Filter<Document>) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await c.deleteOne(filter as any);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async deleteMany(collection: string, filter?: Filter<Document>) {
        const client = new MongoClient(connectionUri);
        try {
            const c = client.db(sbDb!).collection(collection);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await c.deleteMany(filter as any);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async asAtomic<TContext>(operations:
                             {
                                 name: string,
                                 operation: (db: Db, context: TContext) => Promise<boolean>,
                                 rollback?: (db: Db, context: TContext) => Promise<void>
                             }[],
                             context: TContext
    ): Promise<{ success: boolean, error?: string }>
    {

        const client = new MongoClient(connectionUri);
        const db = client.db(sbDb!);

        const successfulOperations: {
            name: string,
            operation: (db: Db, context: TContext) => Promise<boolean>,
            rollback?: (db: Db, context: TContext) => Promise<void>
        }[] = [];

        let needRollback = false;
        let failOperation: { name: string, error: string } | undefined = undefined;

        try {
            for (const o of operations) {
                try {
                    const oRes = await o.operation(db, context);
                    if (!oRes) {
                        failOperation = {name: o.name, error: 'Operation cancelled'};
                        needRollback = true;
                        break;
                    }
                    successfulOperations.push(o);
                } catch (error) {
                    failOperation = {name: o.name, error: (error as { message: string }).message ?? (error as object).toString()};
                    needRollback = true;
                    break;
                }
            }

            if (needRollback) {
                for (const o of successfulOperations) {
                    if (!o.rollback) {
                        continue;
                    }

                    try {
                        await o.rollback(db, context);
                    } catch (error) {
                        console.error("Rollback failed", error);
                        throw error;
                    }
                }
                return {success: false, error: failOperation?.error ?? 'Unknown error'};
            }
        } finally {
            await client.close();
        }

        return { success: true };
    }
}