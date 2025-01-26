import {ModuleActivityType} from "@/models/shared/ModuleActivityType";

export interface ICourseraParsedActivity {
    name: string,
    type: string,
    duration?: number | undefined,
    grade?: string | undefined,
    deadline?: string | undefined,
    completed?: boolean | undefined
}

export interface ICourseraMappedActivity {
    name: string,
    type: ModuleActivityType,
    originalType?: string,
    typeParsed: boolean,
    duration: number,
    durationNotParsed: boolean,
    isCompleted: boolean,
    completionDate?: Date
    deadline?: Date;
}