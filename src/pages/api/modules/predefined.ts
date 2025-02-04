import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IGetPredefinedModulesResponse} from "@/models/api/ModulesModels";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";

// TODO: Move to config
const defaultModuleStartDate = new Date(2024, 9, 14, 12, 0, 0, 0);

class ModulesPredefinedHandler extends BaseApiHandler {
    handlerName: string = "ModulesPredefinedHandler";

    override canHandleGET: boolean = true;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override async handleGET(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const universityId = request.query["universityId"] as string;
        if (!universityId || universityId.length < 1 || !/^\d+$/.test(universityId.trim())) {
            response.status(400).json({error: "Invalid universityId", errorType: "BadRequest"});
            return;
        }

        const dbModules = await moduleRepository.getPredefinedModules(universityId);

        if (!dbModules) {
            response.status(404).json({error: "Modules not found", errorType: "NotFound"});
            return;
        }

        const result: IGetPredefinedModulesResponse = {
            modules: dbModules.map(m => ({
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
                })),
            }))
        };

        response.status(200).json(result);
    }
}

export default async function predefinedHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModulesPredefinedHandler();
    await handler.handle(req, res, true, { disableGETCache: true });
}