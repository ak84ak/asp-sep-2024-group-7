import {IBaseEntityDto} from "@/models/db/IBaseEntityDto";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface IModuleDto extends IBaseEntityDto {
    userId: string;

    universityId: string;
    name: string;
    code: string;
    isCompleted: boolean;
    totalWeeks: number;
    isPredefined: boolean;
    activities: IModuleActivityDto[];
}

export interface IModuleActivityDto extends IBaseEntityDto {
    moduleId: string;
    week: number;
    name: string;
    isCompleted: boolean;
    completionDate?: Date;
    duration: number;
    type: ModuleActivityType;
    order: number;
}