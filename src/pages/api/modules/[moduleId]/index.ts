import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {
    IDeleteModuleResponse,
    IUpdateModuleRequest,
    IUpdateModuleResponse
} from "@/models/api/ModulesModels";

// TODO: Move to config
const defaultModuleStartDate = new Date(2024, 9, 14, 12, 0, 0, 0);

class ModuleByIdIndexHandler extends BaseApiHandler {
    handlerName: string = "ModuleByIdIndexHandler";

    override canHandlePUT: boolean = true;
    override canHandleDELETE: boolean = true;

    setInvalidUpdateModuleResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: IUpdateModuleResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    setInvalidDeleteModuleResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: IDeleteModuleResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    validateUpdateModuleRequest(req: {
        isNameUpdated: boolean,
        newName?: string,
        isCodeUpdated: boolean,
        newCode?: string,
        isTotalWeeksUpdated: boolean,
        newTotalWeeks?: number,
    }, response: NextApiResponse)
    {
        if (req.isNameUpdated) {
            if (!req.newName || req.newName.length < 3) {
                this.setInvalidUpdateModuleResponse(response, 400, 'Invalid name', 'Validation');
                return false;
            }
        }

        if (req.isCodeUpdated) {
            if (!req.newCode || req.newCode.length < 2) {
                this.setInvalidUpdateModuleResponse(response, 400, 'Invalid code', 'Validation');
                return false;
            }
        }

        if (req.isTotalWeeksUpdated) {
            if (!req.newTotalWeeks) {
                this.setInvalidUpdateModuleResponse(response, 400, 'Invalid total weeks', 'Validation');
                return false;
            }

            if (req.newTotalWeeks < 1 || req.newTotalWeeks > 52) {
                this.setInvalidUpdateModuleResponse(response, 400, 'Invalid weeks number', 'Validation');
                return false;
            }
        }

        return true
    }

    override async handlePUT(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const inReq = request.body as IUpdateModuleRequest;

        const moduleId = request.query.moduleId as string;

        const req: {
            isNameUpdated: boolean,
            newName?: string,
            isCodeUpdated: boolean,
            newCode?: string,
            isTotalWeeksUpdated: boolean,
            newTotalWeeks?: number,
            isStartDateUpdated: boolean,
            newStartDate?: string | undefined,
        } = {
            isNameUpdated: inReq.isNameUpdated,
            newName: inReq.newName?.trim(),
            isCodeUpdated: inReq.isCodeUpdated,
            newCode: inReq.newCode?.trim(),
            isTotalWeeksUpdated: inReq.isTotalWeeksUpdated,
            newTotalWeeks: inReq.newTotalWeeks,
            isStartDateUpdated: inReq.isStartDateUpdated,
            newStartDate: inReq.newStartDate,
        };

        if (!this.validateUpdateModuleRequest(req, response)) {
            return;
        }

        try {
            const existingModule = await moduleRepository.getModuleById(moduleId);
            if (!existingModule) {
                this.setInvalidUpdateModuleResponse(response, 404, 'Module not found', 'NotFound');
                return;
            }

            if (existingModule.userId !== user!.id) {
                this.setInvalidUpdateModuleResponse(response, 403, 'Not authorized', 'Authorization');
                return;
            }

            const maxActivityWeek = existingModule.activities.reduce((max, a) => a.week > max ? a.week : max, 0);

            if (req.isTotalWeeksUpdated && existingModule.totalWeeks < maxActivityWeek) {
                this.setInvalidUpdateModuleResponse(response, 400, 'There is activity with higher week number', 'Validation');
                return;
            }

            const m = await moduleRepository.updateModule(
                user!.login,
                moduleId,
                req,
                existingModule.version + 1);

            if (!m) {
                this.setInvalidUpdateModuleResponse(response, 500, 'Failed to update module', 'Internal');
                return;
            }

            const result: IUpdateModuleResponse = {
                success: true,
                module: {
                    id: m.id,
                    version: m.version,
                    name: m.name,
                    code: m.code,
                    isCompleted: m.isCompleted,
                    totalWeeks: m.totalWeeks,
                    startDate: m.startDate ? m.startDate : defaultModuleStartDate.toISOString(),
                    activities: m.activities.map(a => ({
                        id: a.id,
                        version: a.version,
                        week: a.week,
                        name: a.name,
                        isCompleted: a.isCompleted,
                        completionDate: a.completionDate ? a.completionDate : undefined,
                        duration: a.duration,
                        type: a.type,
                        order: a.order
                    }))
                }
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidUpdateModuleResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }

        override async handleDELETE(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
            const sp = GetServiceProvider();
            const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

            const moduleId = request.query.moduleId as string;

            try {
                const existingModule = await moduleRepository.getModuleById(moduleId);
                if (!existingModule) {
                    this.setInvalidDeleteModuleResponse(response, 404, 'Module not found', 'NotFound');
                    return;
                }

                if (existingModule.userId !== user!.id) {
                    this.setInvalidDeleteModuleResponse(response, 403, 'Not authorized', 'Authorization');
                    return;
                }

                // TODO: LOG THIS!!!

                const res = await moduleRepository.deleteModule(user!.id, moduleId);

                if (!res) {
                    this.setInvalidDeleteModuleResponse(response, 500, 'Failed to delete module', 'Internal');
                    return;
                }

                const result: IUpdateModuleResponse = {
                    success: true,
                };

                response.status(200).json(result);
            } catch (error) {
                this.setInvalidDeleteModuleResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
                return;
            }
        }
}

export default async function moduleByIdIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModuleByIdIndexHandler();
    await handler.handle(req, res, true);
}