import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface ICourseModule {
    id: string;
    version: number;

    name: string;
    code: string;
    isCompleted: boolean;
    totalWeeks: number;
    activities: ICourseModuleActivity[];
}

export interface ICourseModuleActivity {
    id: string;
    version: number;

    week: number;
    name: string;
    isCompleted: boolean;
    completionDate?: Date;
    duration: number;
    type: ModuleActivityType;
    order: number;

    deadline?: Date;
}

export interface IGetPredefinedModulesResponse {
    modules: ICourseModule[];
}

export interface IGetUserModulesResponse {
    modules: ICourseModule[];
}

export interface ICreateModuleRequest {
    name: string;
    code: string;
    totalWeeks: number;
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
    module?: ICourseModule;
}

export interface IUpdateModuleRequest {
    isNameUpdated: boolean,
    newName?: string,
    isCodeUpdated: boolean,
    newCode?: string,
    isTotalWeeksUpdated: boolean,
    newTotalWeeks?: number,
}

export interface IUpdateModuleResponse {
    success: boolean;
    error?: string;
    errorType?: string;
    module?: ICourseModule;
}

export interface IDeleteModuleResponse {
    success: boolean;
    error?: string;
    errorType?: string;
}