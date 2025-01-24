import type { NextApiRequest, NextApiResponse } from 'next'

import { GetServiceProvider } from "@/lib/service-provider";
import AuthError from "@/lib/errors/AuthError";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import {IGetCurrentUserResponse} from "@/models/api/CurrentUserModels";

class MeHandler extends BaseApiHandler {
    handlerName: string = "MeHandler";

    override canHandlePOST: boolean = true;

    override async handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const sp = GetServiceProvider();
        const userRepository = await sp.resolve<IUserRepository>("UserRepository");

        try {
            const dbUser = await userRepository.getUserById(user!.id);

            if (!dbUser) {
                response.status(404).json({ error: "User not found", errorType: "NotFound" });
                return;
            }

            const result : IGetCurrentUserResponse = {
                user: {
                    id: dbUser.id,
                    login: dbUser.login,
                    email: dbUser.email
                }
            };

            response.status(200).json(result);
        }
        catch (error) {
            if (error instanceof AuthError) {
                response.status(401).json({ error: error.message, errorType: error.name });
            } else {
                throw error;
            }
        }
    }
}

export default async function meHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new MeHandler();
    await handler.handle(req, res, true);
}