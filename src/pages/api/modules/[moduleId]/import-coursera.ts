import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {
    ICreateActivityRequest,
    ICreateActivityResponse, IImportCourseraActivitiesRequest,
    IImportCourseraActivitiesResponse
} from "@/models/api/ActivitiesModels";
import {mapModuleActivityType, ModuleActivityType} from "@/models/shared/ModuleActivityType";

class ModuleByIdImportCourseraHandler extends BaseApiHandler {
    handlerName: string = "ModuleByIdImportCourseraHandler";

    override canHandlePOST: boolean = true;

    setInvalidResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: IImportCourseraActivitiesResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    validateRequest(req: {
        moduleId: string,
        week: number,
        activities: {
            name: string,
            type: ModuleActivityType,
            duration: number,
            durationNotParsed: boolean,
            isCompleted: boolean,
            completionDate?: Date | undefined,
            deadline?: Date | undefined
        }[]
    }, response: NextApiResponse) {

        if (!req.moduleId) {
            this.setInvalidResponse(response, 400, 'Invalid moduleId', 'Validation');
            return false;
        }

        if (req.week < 1 || req.week > 52) {
            this.setInvalidResponse(response, 400, 'Invalid week number', 'Validation');
            return false;
        }

        if (!req.activities || req.activities.length === 0) {
            this.setInvalidResponse(response, 400, 'No activities provided', 'Validation');
            return false;
        }

        for (let i = 0; i < req.activities.length; i++) {
            const activity = req.activities[i];
            if (!activity.name || activity.name.length < 3) {
                this.setInvalidResponse(response, 400, 'Invalid name', 'Validation');
                return false;
            }

            if (activity.duration < 1 || activity.duration > 7*60) {
                this.setInvalidResponse(response, 400, 'Invalid duration', 'Validation');
                return false;
            }

            if (!activity.type) {
                this.setInvalidResponse(response, 400, 'Invalid type', 'Validation');
                return false;
            }

            if (activity.isCompleted && !activity.completionDate) {
                this.setInvalidResponse(response, 400, 'Completion date not set', 'Validation');
                return false;
            }

            if (activity.completionDate && activity.completionDate > new Date()) {
                this.setInvalidResponse(response, 400, 'Completion date is in the future', 'Validation');
                return false;
            }
        }

        return true
    }

    override async handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const req = request.body as IImportCourseraActivitiesRequest;

        const moduleId = request.query.moduleId as string;
        const week = req.week || 0;

        const activities = req.activities && req.activities.length > 0 ? req.activities.map((a) => ({
            name: a.name,
            type: mapModuleActivityType(a.type),
            duration: a.duration,
            durationNotParsed: a.durationNotParsed,
            isCompleted: a.isCompleted,
            completionDate: a.completionDate ? new Date(a.completionDate) : undefined,
            deadline: a.deadline ? new Date(a.deadline) : undefined
        })) : [];

        if (!this.validateRequest({ moduleId, week, activities }, response)) {
            return;
        }

        try {
            const m = await moduleRepository.getModuleById(moduleId);
            if (!m) {
                this.setInvalidResponse(response, 404, 'Module not found', 'NotFound');
                return;
            }

            if (m.userId !== user!.id) {
                this.setInvalidResponse(response, 403, 'Not authorized', 'Authorization');
                return;
            }

            if (m.totalWeeks < week) {
                this.setInvalidResponse(response, 400, 'The module has less weeks', 'Validation');
                return;
            }

            let order = 1;
            const weekActivities = m.activities.filter(a => a.week === week);

            if (weekActivities.length > 0) {
                // Get latest order
                const latestOrder = weekActivities.reduce((max, a) => a.order > max ? a.order : max, 0);
                order = latestOrder + 1;
            }

            const createResult = await moduleRepository.createActivities(
                user!.login,
                moduleId,
                week,
                order,
                activities);

            if (!createResult) {
                this.setInvalidResponse(response, 500, 'Failed to create activity', 'Internal');
                return;
            }

            const result: IImportCourseraActivitiesResponse = {
                success: true,
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }
}

export default async function moduleByIdImportCourseraHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModuleByIdImportCourseraHandler();
    await handler.handle(req, res, true);
}