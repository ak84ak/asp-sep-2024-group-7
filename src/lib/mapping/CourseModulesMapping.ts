import {ICourseModuleActivityApiModel, ICourseModuleApiModel} from "@/models/api/ModulesModels";
import {ICourseModule, ICourseModuleActivity} from "@/models/domain/ModulesModels";

// TODO: Move to config
const defaultModuleStartDate = new Date(2024, 9, 14, 12, 0, 0, 0);

const mapActivityApiToDomain = (activity: ICourseModuleActivityApiModel): ICourseModuleActivity => {
    return {
        id: activity.id,
        version: activity.version,
        week: activity.week,
        name: activity.name,
        isCompleted: activity.isCompleted,
        completionDate: activity.completionDate ? new Date(activity.completionDate) : undefined,
        duration: activity.duration,
        type: activity.type,
        order: activity.order,
        deadline: activity.deadline ? new Date(activity.deadline) : undefined
    }
}

const mapModuleApiToDomain = (module: ICourseModuleApiModel): ICourseModule => {
    return {
        id: module.id,
        version: module.version,
        name: module.name,
        code: module.code,
        isCompleted: module.isCompleted,
        totalWeeks: module.totalWeeks,
        startDate: module.startDate ? new Date(module.startDate) : new Date(defaultModuleStartDate),
        activities: module.activities.map(mapActivityApiToDomain)
    };
};

export { mapModuleApiToDomain, mapActivityApiToDomain };