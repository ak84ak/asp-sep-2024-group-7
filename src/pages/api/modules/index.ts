import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";
import {ICreateModuleRequest, ICreateModuleRequestActivity, ICreateModuleResponse} from "@/models/api/ModulesModels";

class ModulesHandler extends BaseApiHandler {
    handlerName: string = "ModulesHandler";

    override canHandlePOST: boolean = true;

    setInvalidCreateModuleResponse(response: NextApiResponse, code: number, errorMessage: string, errorType: string) {
        const res: ICreateModuleResponse = {
            success: false,
            error: errorMessage,
            errorType: errorType
        };
        response.status(code).json(res);
    }

    validateCreateModuleRequest(req: {
        universityId: string,
        name: string,
        code: string,
        weeks: number,
        activities: ICreateModuleRequestActivity[]
    }, response: NextApiResponse)
    {
        // TODO: Add more universities
        if (req.universityId !== "1") {
            this.setInvalidCreateModuleResponse(response, 400, 'Invalid universityId', 'Validation');
            return false;
        }

        if (!req.name || req.name.length < 3) {
            this.setInvalidCreateModuleResponse(response, 400, 'Invalid name', 'Validation');
            return false;
        }

        if (!req.code || req.code.length < 2) {
            this.setInvalidCreateModuleResponse(response, 400, 'Invalid code', 'Validation');
            return false;
        }

        if (req.weeks < 1 || req.weeks > 52) {
            this.setInvalidCreateModuleResponse(response, 400, 'Invalid weeks number', 'Validation');
            return false;
        }

        if (req.activities === undefined) {
            this.setInvalidCreateModuleResponse(response, 400, 'Activities are missing', 'Validation');
            return false;
        }

        // TODO: Add validation for activities

        return true
    }

    override async handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const req = request.body as ICreateModuleRequest;

        const universityId = req.universityId?.trim() || "";
        const name = req.name?.trim() || "";
        const code = req.code?.trim() || "";
        const weeks = req.totalWeeks || 0;
        const activities = req.activities || undefined;

        if (!this.validateCreateModuleRequest({ universityId, name, code, weeks, activities }, response)) {
            return;
        }

        try {
            const m = await moduleRepository.createModule(user!.login, user!.id, universityId, name, code, weeks, activities);

            if (!m) {
                this.setInvalidCreateModuleResponse(response, 500, 'Failed to create module', 'Internal');
                return;
            }

            const result: ICreateModuleResponse = {
                success: true,
                module: {
                    id: m.id,
                    version: m.version,
                    name: m.name,
                    code: m.code,
                    isCompleted: m.isCompleted,
                    totalWeeks: m.totalWeeks,
                    activities: m.activities.map(a => ({
                        id: a.id,
                        version: a.version,
                        week: a.week,
                        name: a.name,
                        isCompleted: a.isCompleted,
                        completionDate: a.completionDate,
                        duration: a.duration,
                        type: a.type,
                        order: a.order
                    }))
                }
            };

            response.status(200).json(result);
        } catch (error) {
            this.setInvalidCreateModuleResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error', 'Internal');
            return;
        }
    }
}

export default async function modulesHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModulesHandler();
    await handler.handle(req, res, true);
}