import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface ICourseModuleApiModel {
    id: string;
    version: number;

    name: string;
    code: string;
    isCompleted: boolean;
    totalWeeks: number;
    startDate: string;
    activities: ICourseModuleActivityApiModel[];
}

export interface ICourseModuleActivityApiModel {
    id: string;
    version: number;

    week: number;
    name: string;
    isCompleted: boolean;
    completionDate?: string;
    duration: number;
    type: ModuleActivityType;
    order: number;

    deadline?: string;
}

export interface IGetPredefinedModulesResponse {
    modules: ICourseModuleApiModel[];
}

export interface IGetUserModulesResponse {
    modules: ICourseModuleApiModel[];
}

export interface ICreateModuleRequest {
    name: string;
    code: string;
    totalWeeks: number;
    startDate: string;
    universityId: string;
    activities: ICreateModuleRequestActivity[];
}

export interface ICreateModuleRequestActivity {
    week: number;
    name: string;
    duration: number;
    type: ModuleActivityType;
    order: number;
}

export interface ICreateModuleResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    module?: ICourseModuleApiModel;
}

export interface IUpdateModuleRequest {
    isNameUpdated: boolean,
    newName?: string,
    isCodeUpdated: boolean,
    newCode?: string,
    isTotalWeeksUpdated: boolean,
    newTotalWeeks?: number,
    isStartDateUpdated: boolean,
    newStartDate?: string,
}

export interface IUpdateModuleResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    module?: ICourseModuleApiModel;
}

export interface IDeleteModuleResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}