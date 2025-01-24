import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {ICreateActivityRequest, ICreateActivityResponse} from "@/models/api/ActivitiesModels";
import {mapModuleActivityType, ModuleActivityType} from "@/models/shared/ModuleActivityType";

class ModuleByIdActivitiesIndexHandler extends BaseApiHandler {
    handlerName: string = "ModuleByIdActivitiesIndexHandler";

    override canHandlePOST: boolean = true;

    setInvalidCreateActivityResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: ICreateActivityResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    validateCreateActivityRequest(req: {
        moduleId: string,
        week: number,
        name: string,
        duration: number,
        type: ModuleActivityType | undefined,
        isCompleted: boolean,
        completionDate?: Date
    }, response: NextApiResponse) {

        if (!req.moduleId) {
            this.setInvalidCreateActivityResponse(response, 400, 'Invalid moduleId', 'Validation');
            return false;
        }

        if (req.week < 1 || req.week > 52) {
            this.setInvalidCreateActivityResponse(response, 400, 'Invalid week number', 'Validation');
            return false;
        }

        if (!req.name || req.name.length < 3) {
            this.setInvalidCreateActivityResponse(response, 400, 'Invalid name', 'Validation');
            return false;
        }

        if (req.duration < 1 || req.duration > 7*60) {
            this.setInvalidCreateActivityResponse(response, 400, 'Invalid duration', 'Validation');
            return false;
        }

        if (!req.type) {
            this.setInvalidCreateActivityResponse(response, 400, 'Invalid type', 'Validation');
            return false;
        }

        if (req.isCompleted && !req.completionDate) {
            this.setInvalidCreateActivityResponse(response, 400, 'Completion date not set', 'Validation');
            return false;
        }

        if (req.completionDate && req.completionDate > new Date()) {
            this.setInvalidCreateActivityResponse(response, 400, 'Completion date is in the future', 'Validation');
            return false;
        }

        return true
    }

    override async handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const req = request.body as ICreateActivityRequest;

        const moduleId = request.query.moduleId as string;
        const week = req.week || 0;
        const name = req.name?.trim() || "";
        const duration = req.duration || 0;
        const type = req.type ? mapModuleActivityType(req.type) : undefined;

        if (!this.validateCreateActivityRequest({ moduleId, week, name, duration, type, isCompleted: req.isCompleted, completionDate: req.completionDate }, response)) {
            return;
        }

        try {
            const m = await moduleRepository.getModuleById(moduleId);
            if (!m) {
                this.setInvalidCreateActivityResponse(response, 404, 'Module not found', 'NotFound');
                return;
            }

            if (m.userId !== user!.id) {
                this.setInvalidCreateActivityResponse(response, 403, 'Not authorized', 'Authorization');
                return;
            }

            if (m.totalWeeks < week) {
                this.setInvalidCreateActivityResponse(response, 400, 'The module has less weeks', 'Validation');
                return;
            }

            let order = 1;
            const weekActivities = m.activities.filter(a => a.week === week);

            if (weekActivities.length > 0) {
                // Get latest order
                const latestOrder = weekActivities.reduce((max, a) => a.order > max ? a.order : max, 0);
                order = latestOrder + 1;
            }

            const a = await moduleRepository.createActivity(
                user!.login,
                moduleId,
                week,
                name,
                req.isCompleted,
                req.completionDate,
                duration,
                type,
                order);

            if (!a) {
                this.setInvalidCreateActivityResponse(response, 500, 'Failed to create activity', 'Internal');
                return;
            }

            const result: ICreateActivityResponse = {
                success: true,
                activity: {
                    id: a.id,
                    version: a.version,
                    week: a.week,
                    name: a.name,
                    isCompleted: a.isCompleted,
                    completionDate: a.completionDate,
                    duration: a.duration,
                    type: a.type,
                    order: a.order
                }
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidCreateActivityResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }
}

export default async function moduleByIdActivitiesIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModuleByIdActivitiesIndexHandler();
    await handler.handle(req, res, true);
}