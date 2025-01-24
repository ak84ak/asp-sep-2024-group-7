import type {NextApiRequest, NextApiResponse} from 'next'

import {GetServiceProvider} from "@/lib/service-provider";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IGetUserModulesResponse} from "@/models/api/ModulesModels";
import {IModuleRepository} from "@/lib/data-access/IModuleRepository";

class ModulesUserHandler extends BaseApiHandler {
    handlerName: string = "ModulesUserHandler";

    override canHandleGET: boolean = true;

    override async handleGET(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const moduleRepository = await sp.resolve<IModuleRepository>("ModuleRepository");

        const dbModules = await moduleRepository.getModulesByUserId(user!.id);

        if (!dbModules) {
            response.status(404).json({error: "Modules not found", errorType: "NotFound"});
            return;
        }

        const result: IGetUserModulesResponse = {
            modules: dbModules.map(m => ({
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
                })),
            }))
        };

        response.status(200).json(result);
    }
}

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new ModulesUserHandler();
    await handler.handle(req, res, true, { disableGETCache: true });
}