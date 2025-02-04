import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {
    IDeleteActivityResponse, IUpdateActivityRequest,
    IUpdateActivityResponse
} from "@/models/api/ActivitiesModels";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {IUpdateModuleResponse} from "@/models/api/ModulesModels";

class ModuleByIdActivitiesByIdHandler extends BaseApiHandler {
    handlerName: string = "ModuleByIdActivitiesByIdHandler";

    override canHandlePUT: boolean = true;
    override canHandleDELETE: boolean = true;

    setInvalidUpdateActivityResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: IUpdateActivityResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    setInvalidDeleteActivityResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: IDeleteActivityResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    validateUpdateActivityRequest(req: {
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
    }, response: NextApiResponse) {

        if (req.isNameUpdated) {
            if (!req.newName || req.newName.length < 3) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Invalid name', 'Validation');
                return false;
            }
        }

        if (req.isDurationUpdated) {
            if (!req.newDuration || req.newDuration < 1 || req.newDuration > 7*60) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Invalid duration', 'Validation');
                return false;
            }
        }

        if (req.isTypeUpdated) {
            if (!req.newType) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Invalid type', 'Validation');
                return false;
            }
        }

        if (req.isCompletedUpdated) {
            if (req.newIsCompleted && !req.newCompletionDate) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Completion date not set', 'Validation');
                return false;
            }

            if (req.newCompletionDate && req.newCompletionDate > new Date()) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Completion date is in the future', 'Validation');
                return false;
            }
        }

        if (req.isOrderUpdated) {
            if (!req.newOrder || req.newOrder < 1) {
                this.setInvalidUpdateActivityResponse(response, 400, 'Invalid order', 'Validation');
                return false;
            }
        }

        return true
    }

    override async handlePUT(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const inReq = request.body as IUpdateActivityRequest;

        const moduleId = request.query.moduleId as string;
        const activityId = request.query.activityId as string;

        const req: {
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
        } = {
            isNameUpdated: inReq.isNameUpdated,
            newName: inReq.newName?.trim(),
            isCompletedUpdated: inReq.isCompletedUpdated,
            newIsCompleted: inReq.newIsCompleted,
            isCompletionDateUpdated: inReq.isCompletionDateUpdated,
            newCompletionDate: inReq.newCompletionDate ? new Date(inReq.newCompletionDate) : undefined,
            isDurationUpdated: inReq.isDurationUpdated,
            newDuration: inReq.newDuration,
            isTypeUpdated: inReq.isTypeUpdated,
            newType: inReq.newType,
            isOrderUpdated: inReq.isOrderUpdated,
            newOrder: inReq.newOrder
        }

        if (!this.validateUpdateActivityRequest(req, response)) {
            return;
        }

        try {
            const m = await moduleRepository.getModuleById(moduleId);
            if (!m) {
                this.setInvalidUpdateActivityResponse(response, 404, 'Module not found', 'NotFound');
                return;
            }

            if (m.userId !== user!.id) {
                this.setInvalidUpdateActivityResponse(response, 403, 'Not authorized', 'Authorization');
                return;
            }

            const existingActivity = m.activities.find(a => a.id === activityId);

            if (!existingActivity) {
                this.setInvalidUpdateActivityResponse(response, 404, 'Activity not found', 'NotFound');
                return;
            }

            const a = await moduleRepository.updateActivity(
                user!.login,
                activityId,
                req,
                existingActivity.version + 1);

            if (!a) {
                this.setInvalidUpdateActivityResponse(response, 500, 'Failed to update activity', 'Internal');
                return;
            }

            const result: IUpdateActivityResponse = {
                success: true,
                activity: {
                    id: a.id,
                    version: a.version,
                    week: a.week,
                    name: a.name,
                    isCompleted: a.isCompleted,
                    completionDate: a.completionDate ? a.completionDate : undefined,
                    duration: a.duration,
                    type: a.type,
                    order: a.order
                }
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidUpdateActivityResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }

    override async handleDELETE(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const moduleId = request.query.moduleId as string;
        const activityId = request.query.activityId as string;

        try {
            const m = await moduleRepository.getModuleById(moduleId);
            if (!m) {
                this.setInvalidDeleteActivityResponse(response, 404, 'Module not found', 'NotFound');
                return;
            }
            if (m.userId !== user!.id) {
                this.setInvalidDeleteActivityResponse(response, 403, 'Not authorized', 'Authorization');
                return;
            }

            const existingActivity = m.activities.find(a => a.id === activityId);
            if (!existingActivity) {
                this.setInvalidDeleteActivityResponse(response, 404, 'Activity not found', 'NotFound');
                return;
            }

            // TODO: LOG THIS!!!

            const res = await moduleRepository.deleteActivity(user!.id, activityId);

            if (!res) {
                this.setInvalidDeleteActivityResponse(response, 500, 'Failed to delete module', 'Internal');
                return;
            }

            const result: IUpdateModuleResponse = {
                success: true,
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidDeleteActivityResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }
}

export default async function moduleByIdActivitiesByIdHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModuleByIdActivitiesByIdHandler();
    await handler.handle(req, res, true);
}