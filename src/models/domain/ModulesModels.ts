import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface ICourseModule {
    id: string;
    version: number;

    name: string;
    code: string;
    isCompleted: boolean;
    totalWeeks: number;
    startDate: Date;
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