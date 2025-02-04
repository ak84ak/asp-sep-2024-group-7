import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {ICourseModuleActivityApiModel} from "@/models/api/ModulesModels";

export interface ICreateActivityRequest {
    week: number;
    name: string;
    isCompleted: boolean;
    completionDate?: string;
    duration: number;
    type: ModuleActivityType;
    deadline?: string;
}

export interface ICreateActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    activity?: ICourseModuleActivityApiModel;
}

export interface IUpdateActivityRequest {
    isNameUpdated: boolean,
    newName?: string,
    isCompletedUpdated: boolean,
    newIsCompleted?: boolean,
    isCompletionDateUpdated: boolean,
    newCompletionDate?: string | undefined,
    isDurationUpdated: boolean,
    newDuration?: number,
    isTypeUpdated: boolean,
    newType?: ModuleActivityType,
    isOrderUpdated: boolean,
    newOrder?: number,
    isDeadlineUpdated: boolean,
    newDeadline?: string | undefined
}

export interface IUpdateActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    activity?: ICourseModuleActivityApiModel;
}

export interface IDeleteActivityResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}

export interface IImportCourseraActivitiesRequest {
    week: number;
    activities: IImportCourseraActivitiesRequestActivity[];
}

export interface IImportCourseraActivitiesRequestActivity {
    name: string,
    type: ModuleActivityType,
    duration: number,
    durationNotParsed: boolean,
    isCompleted: boolean,
    completionDate?: string | undefined,
    deadline?: string | undefined
}

export interface IImportCourseraActivitiesResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}