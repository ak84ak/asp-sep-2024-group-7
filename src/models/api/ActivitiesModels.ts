import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {ICourseModuleActivity} from "@/models/api/ModulesModels";

export interface ICreateActivityRequest {
    week: number;
    name: string;
    isCompleted: boolean;
    completionDate?: Date;
    duration: number;
    type: ModuleActivityType;
}

export interface ICreateActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    activity?: ICourseModuleActivity;
}

export interface IUpdateActivityRequest {
    isNameUpdated: boolean,
    newName?: string,
    isCompletedUpdated: boolean,
    newIsCompleted?: boolean,
    isCompletionDateUpdated: boolean,
    newCompletionDate?: Date | undefined,
    isDurationUpdated: boolean,
    newDuration?: number,
    isTypeUpdated: boolean,
    newType?: ModuleActivityType,
    isOrderUpdated: boolean,
    newOrder?: number,
}

export interface IUpdateActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    activity?: ICourseModuleActivity;
}

export interface IDeleteActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}

export interface IImportCourseraActivitiesRequest {
    week: number;
    activities: IImportCourseraActivity[];
}

export interface IImportCourseraActivity {
    name: string,
    type: ModuleActivityType,
    duration: number,
    durationNotParsed: boolean,
    isCompleted: boolean,
    completionDate?: Date
    deadline?: Date;
}

export interface IImportCourseraActivitiesResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}