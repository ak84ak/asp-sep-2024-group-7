import {IModuleActivityDto, IModuleDto} from "@/models/db/IModuleDto";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface IModuleRepository {
    getPredefinedModules(universityId: string): Promise<IModuleDto[] | null>;
    getModulesByUserId(userId: string): Promise<IModuleDto[] | null>;
    getModuleById(moduleId: string): Promise<IModuleDto | null>;

    createModule(
        operator: string,
        userId: string,
        universityId: string,
        name: string,
        code: string,
        totalWeeks: number,
        activities: {
            week: number,
            name: string,
            duration: number,
            type: ModuleActivityType,
            order: number
        }[]): Promise<IModuleDto | null>;

    getActivityById(activityId: string): Promise<IModuleActivityDto | null>;

    createActivity(
        operator: string,
        moduleId: string,
        week: number,
        name: string,
        isCompleted: boolean,
        completionDate: Date | undefined,
        duration: number,
        type: ModuleActivityType | undefined,
        order: number): Promise<IModuleActivityDto | null>;

    updateModule(
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
    ): Promise<IModuleDto | null>;

    deleteModule(operator: string, moduleId: string): Promise<boolean>;

    updateActivity(operator: string, activityId: string, updateRequest: {
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
        newOrder?: number
    }, newVersion: number): Promise<IModuleActivityDto | null>;

    deleteActivity(operator: string, activityId: string): Promise<boolean>;
}