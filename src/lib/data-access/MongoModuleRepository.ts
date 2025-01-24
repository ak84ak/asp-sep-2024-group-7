import SBMongoDb from "@/lib/data-access/SBMongoDb";
import {ObjectId} from "mongodb";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {IModuleActivityDto, IModuleDto} from "@/models/db/IModuleDto";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export default class MongoModuleRepository implements IModuleRepository {
    async getPredefinedModules(universityId: string): Promise<IModuleDto[] | null> {
        const db = new SBMongoDb();

        const dbModules = await db.find("modules", {universityId: universityId, isPredefined: true});
        if (!dbModules) {
            return null;
        }

        const modules: IModuleDto[] = dbModules.map(m => ({
            id: m._id.toString(),
            createdOn: m.createdOn,
            createdBy: m.createdBy,
            updatedOn: m.updatedOn,
            updatedBy: m.updatedBy,
            version: m.version ?? 1,

            userId: m.userId,
            universityId: m.universityId.toString(),
            name: m.name,
            code: m.code,
            isCompleted: m.isCompleted,
            totalWeeks: m.totalWeeks,
            isPredefined: m.isPredefined,
            activities: []
        }))

        const dbModulesActivities = await db.find("activities", {moduleId: {$in: modules.map(m => m.id)}});
        if (!dbModulesActivities) {
            return null;
        }

        for (const m of modules) {
            m.activities = dbModulesActivities.filter(a => a.moduleId === m.id).map(a => ({
                id: a._id.toString(),
                createdOn: a.createdOn,
                createdBy: a.createdBy,
                updatedOn: a.updatedOn,
                updatedBy: a.updatedBy,
                version: a.version ?? 1,

                moduleId: a.moduleId.toString(),
                week: a.week,
                name: a.name,
                isCompleted: a.completed,
                completionDate: a.completionDate,
                duration: a.duration,
                type: a.type,
                order: a.order
            }));
        }

        return modules;
    }

    async getModuleById(moduleId: string): Promise<IModuleDto | null> {
        const db = new SBMongoDb();

        const dbModule = await db.findOne("modules", {_id: new ObjectId(moduleId)});
        if (!dbModule) {
            return null;
        }

        const resModule: IModuleDto = {
            id: dbModule._id.toString(),
            createdOn: dbModule.createdOn,
            createdBy: dbModule.createdBy,
            updatedOn: dbModule.updatedOn,
            updatedBy: dbModule.updatedBy,
            version: dbModule.version ?? 1,

            userId: dbModule.userId,
            universityId: dbModule.universityId.toString(),
            name: dbModule.name,
            code: dbModule.code,
            isCompleted: dbModule.isCompleted,
            totalWeeks: dbModule.totalWeeks,
            isPredefined: dbModule.isPredefined,
            activities: []
        };

        const dbModuleActivities = await db.find("activities", {moduleId: moduleId});
        if (!dbModuleActivities) {
            return null;
        }

        resModule.activities = dbModuleActivities.map(a => ({
            id: a._id.toString(),
            createdOn: a.createdOn,
            createdBy: a.createdBy,
            updatedOn: a.updatedOn,
            updatedBy: a.updatedBy,
            version: a.version ?? 1,

            moduleId: a.moduleId.toString(),
            week: a.week,
            name: a.name,
            isCompleted: a.isCompleted,
            completionDate: a.completionDate,
            duration: a.duration,
            type: a.type,
            order: a.order
        }));

        return resModule;
    }

    async getModulesByUserId(userId: string): Promise<IModuleDto[] | null> {
        const db = new SBMongoDb();

        const dbModules = await db.find("modules", {userId: userId});
        if (!dbModules) {
            return null;
        }

        const modules: IModuleDto[] = dbModules.map(m => ({
            id: m._id.toString(),
            createdOn: m.createdOn,
            createdBy: m.createdBy,
            updatedOn: m.updatedOn,
            updatedBy: m.updatedBy,
            version: m.version ?? 1,

            userId: m.userId,
            universityId: m.universityId.toString(),
            name: m.name,
            code: m.code,
            isCompleted: m.isCompleted,
            totalWeeks: m.totalWeeks,
            isPredefined: m.isPredefined,
            activities: []
        }))

        const dbModulesActivities = await db.find("activities", {moduleId: {$in: modules.map(m => m.id)}});
        if (!dbModulesActivities) {
            return null;
        }

        for (const m of modules) {
            m.activities = dbModulesActivities.filter(a => a.moduleId === m.id).map(a => ({
                id: a._id.toString(),
                createdOn: a.createdOn,
                createdBy: a.createdBy,
                updatedOn: a.updatedOn,
                updatedBy: a.updatedBy,
                version: a.version ?? 1,

                moduleId: a.moduleId.toString(),
                week: a.week,
                name: a.name,
                isCompleted: a.isCompleted,
                completionDate: a.completionDate,
                duration: a.duration,
                type: a.type,
                order: a.order
            }));
        }

        return modules;
    }

    async createModule(
        operator: string,
        userId: string,
        universityId: string,
        name: string,
        code: string,
        totalWeeks: number,
        activities: {
            week: number;
            name: string;
            duration: number;
            type: ModuleActivityType;
            order: number;
        }[]): Promise<IModuleDto | null>
    {
        const db = new SBMongoDb();

        let moduleId: string | undefined = undefined;

        const atomicCtx: { insertedModuleId: string | undefined } = {insertedModuleId: undefined};
        const atomicResult = await db.asAtomic<{ insertedModuleId?: string }>([
            {
                name: "Insert module",
                operation: async (db, ctx) => {
                    const modulesCollection = db.collection("modules");

                    const moduleRes = await modulesCollection.insertOne({
                        createdOn: new Date(),
                        createdBy: operator ?? "UNKNOWN",
                        updatedOn: new Date(),
                        updatedBy: operator ?? "UNKNOWN",
                        version: 1,

                        userId: userId,

                        universityId: universityId,
                        name: name,
                        code: code,
                        isCompleted: false,
                        totalWeeks: totalWeeks,
                        isPredefined: false
                    });

                    moduleId = moduleRes.insertedId.toString();
                    ctx.insertedModuleId = moduleId;

                    return true;
                },
                rollback: async (db, ctx) => {
                    if (ctx.insertedModuleId) {
                        await db.collection("modules").deleteOne({_id: new ObjectId(ctx.insertedModuleId)});
                    }
                }
            },
            {
                name: "Insert activities",
                operation: async (db, ctx) => {
                    if (!ctx.insertedModuleId) {
                        return false;
                    }

                    if (activities.length > 0) {
                        const activitiesCollection = db.collection("activities");

                        await activitiesCollection.insertMany(activities.map(a => ({
                            createdOn: new Date(),
                            createdBy: operator ?? "UNKNOWN",
                            updatedOn: new Date(),
                            updatedBy: operator ?? "UNKNOWN",
                            version: 1,

                            moduleId: ctx.insertedModuleId,
                            week: a.week,
                            name: a.name,
                            isCompleted: false,
                            completedDate: undefined,
                            duration: a.duration,
                            type: a.type,
                            order: a.order
                        })));
                    }

                    return true;
                }
            }], atomicCtx);

        if (!atomicResult.success || !atomicCtx.insertedModuleId) {
            console.log(atomicResult);
            throw new Error("Module create failed");
        }

        return await this.getModuleById(atomicCtx.insertedModuleId);
    }

    async updateModule(
        operator: string,
        moduleId: string,
        updateRequest: {
            isNameUpdated: boolean,
            newName?: string,
            isCodeUpdated: boolean,
            newCode?: string,
            isTotalWeeksUpdated: boolean,
            newTotalWeeks?: number,
        },
        newVersion: number
    ): Promise<IModuleDto | null>
    {
        const db = new SBMongoDb();

        const dbSet: {
            version: number;
            updatedOn: Date;
            updatedBy: string;
            name?: string;
            code?: string;
            totalWeeks?: number;
        } = {
            version: newVersion,
            updatedOn: new Date(),
            updatedBy: operator ?? "UNKNOWN"
        };

        if (updateRequest.isNameUpdated) {
            dbSet["name"] = updateRequest.newName;
        }
        if (updateRequest.isCodeUpdated) {
            dbSet["code"] = updateRequest.newCode;
        }
        if (updateRequest.isTotalWeeksUpdated) {
            dbSet["totalWeeks"] = updateRequest.newTotalWeeks;
        }

        const res = await db.updateOne("modules",
            {_id: new ObjectId(moduleId), version: { $lt: newVersion }},
            { $set: dbSet }
        );

        if (!res) {
            throw new Error("Module update failed");
        }

        if (res.modifiedCount !== 1) {
            throw new Error("Newer version of module exists in DB!");
        }

        return await this.getModuleById(moduleId);
    }

    async deleteModule(
        operator: string,
        moduleId: string
    ): Promise<boolean>
    {
        const db = new SBMongoDb();

        // TODO: LOG OPERATOR NAME
        // TODO: Delete PLANS

        const activitiesDeleteResult = await db.deleteMany("activities", { moduleId: moduleId });

        const moduleDeleteResult = await db.deleteOne("modules", { _id: new ObjectId(moduleId) });

        if (!activitiesDeleteResult) {
            throw new Error("Module's activities delete failed");
        }

        if (!moduleDeleteResult || !moduleDeleteResult.deletedCount) {
            throw new Error("Module delete failed");
        }

        return true;
    }

    async getActivityById(activityId: string): Promise<IModuleActivityDto | null> {
        const db = new SBMongoDb();

        const dbActivity = await db.findOne("activities", {_id: new ObjectId(activityId)});
        if (!dbActivity) {
            return null;
        }

        const resActivity: IModuleActivityDto = {
            id: dbActivity._id.toString(),
            createdOn: dbActivity.createdOn,
            createdBy: dbActivity.createdBy,
            updatedOn: dbActivity.updatedOn,
            updatedBy: dbActivity.updatedBy,
            version: dbActivity.version ?? 1,

            moduleId: dbActivity.moduleId,
            week: dbActivity.week,
            name: dbActivity.name,
            isCompleted: dbActivity.isCompleted,
            completionDate: dbActivity.completionDate,
            duration: dbActivity.duration,
            type: dbActivity.type,
            order: dbActivity.order
        };

        return resActivity;
    }

    async createActivity(
        operator: string,
        moduleId: string,
        week: number,
        name: string,
        isCompleted: boolean,
        completionDate: Date | undefined,
        duration: number,
        type: ModuleActivityType | undefined,
        order: number): Promise<IModuleActivityDto | null>
    {

        const db = new SBMongoDb();

        const res = await db.insertOne("activities", {
            createdOn: new Date(),
            createdBy: operator ?? "UNKNOWN",
            updatedOn: new Date(),
            updatedBy: operator ?? "UNKNOWN",
            version: 1,

            moduleId: moduleId,
            week: week,
            name: name,
            isCompleted: isCompleted,
            completionDate: completionDate,
            duration: duration,
            type: type,
            order: order
        });

        const activityId = res.insertedId?.toString();
        if (!activityId) {
            throw new Error("Activity create failed");
        }

        return await this.getActivityById(activityId);
    }

    async updateActivity(operator: string, activityId: string, updateRequest: {
        isNameUpdated: boolean;
        newName?: string;
        isCompletedUpdated: boolean;
        newIsCompleted?: boolean;
        isCompletionDateUpdated: boolean;
        newCompletionDate?: Date | undefined;
        isDurationUpdated: boolean;
        newDuration?: number;
        isTypeUpdated: boolean;
        newType?: ModuleActivityType;
        isOrderUpdated: boolean;
        newOrder?: number;
    }, newVersion: number): Promise<IModuleActivityDto | null>
    {
        const db = new SBMongoDb();

        const dbSet: {
            version: number;
            updatedOn: Date;
            updatedBy: string;
            name?: string;
            isCompleted?: boolean;
            completionDate?: Date;
            duration?: number;
            type?: ModuleActivityType;
            order?: number;
        } = {
            version: newVersion,
            updatedOn: new Date(),
            updatedBy: operator ?? "UNKNOWN"
        };

        if (updateRequest.isNameUpdated) {
            dbSet["name"] = updateRequest.newName;
        }
        if (updateRequest.isCompletedUpdated) {
            dbSet["isCompleted"] = updateRequest.newIsCompleted;
        }
        if (updateRequest.isCompletionDateUpdated) {
            dbSet["completionDate"] = updateRequest.newCompletionDate;
        }
        if (updateRequest.isDurationUpdated) {
            dbSet["duration"] = updateRequest.newDuration;
        }
        if (updateRequest.isTypeUpdated) {
            dbSet["type"] = updateRequest.newType;
        }
        if (updateRequest.isOrderUpdated) {
            dbSet["order"] = updateRequest.newOrder;
        }

        const res = await db.updateOne("activities",
            {_id: new ObjectId(activityId), version: { $lt: newVersion }},
            { $set: dbSet }
        );

        if (!res) {
            throw new Error("Activity update failed");
        }

        if (res.modifiedCount !== 1) {
            throw new Error("Newer version of activity exists in DB!");
        }

        return await this.getActivityById(activityId);
    }

    async deleteActivity(operator: string, activityId: string): Promise<boolean> {
        const db = new SBMongoDb();

        // TODO: Delete PLANS
        // TODO: LOG OPERATOR NAME

        const activityDeleteResult = await db.deleteOne("activities", { _id: new ObjectId(activityId) });

        if (!activityDeleteResult || !activityDeleteResult.deletedCount) {
            throw new Error("Activity delete failed");
        }

        return true;
    }
}