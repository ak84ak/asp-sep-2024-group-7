import type { NextApiRequest, NextApiResponse } from 'next'

import { ILoginRequest, ILoginResponse } from "@/models/api/LoginModels";
import { GetServiceProvider } from "@/lib/service-provider";
import IAuthService from "@/lib/services/IAuthService";
import AuthError from "@/lib/errors/AuthError";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import IAuthUser from "@/models/api-internal/IAuthUser";

class LoginHandler extends BaseApiHandler {
    handlerName: string = "LoginHandler";

    override canHandlePOST: boolean = true;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override async handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        const req = await request.body as ILoginRequest;

        if (!req.login || !req.password) {
            response.status(400).json({ error: 'Mandatory fields missed', errorType: 'BadRequest' });
            return;
        }

        const sp = GetServiceProvider();
        const authService = await sp.resolve<IAuthService>("AuthService");

        try {
            const token = await authService.authenticateUser(req.login, req.password);

            // TODO
            //logger.info("Login successful", { login: req.login, tokenValidTo: token.validTo });

            const result : ILoginResponse = {
                token: token.token,
                validTo: token.validTo.toISOString()
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

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new LoginHandler();
    await handler.handle(req, res, false);
}