import type { NextApiRequest, NextApiResponse } from 'next'

import { GetServiceProvider } from "@/lib/service-provider";
import IAuthService from "@/lib/services/IAuthService";
import {IRegistrationRequest, IRegistrationResponse} from "@/models/api/RegistrationModels";
import BaseApiHandler from "@/lib/api-base/BaseApiHandler";

const flags = {
    registrationEnabled: process.env.SB_FLAGS_REGISTRATION_ENABLED === '1',
    registrationByInvitationOnly: process.env.SB_FLAGS_REGISTRATION_INVITATION_ONLY === '1',
    invitationCodes: process.env.SB_FLAGS_REGISTRATION_INVITATION_CODES?.split(',') ?? []
}

class RegistrationHandler extends BaseApiHandler {
    handlerName: string = "RegistrationHandler";

    override canHandlePOST: boolean = true;

    setInvalidRegistrationResponse(response: NextApiResponse, code: number, errorMessage: string) {
        const res: IRegistrationResponse = {
            success: false,
            errorMessage: errorMessage
        };
        response.status(code).json(res);
    }

    validateRegistrationRequest(req: IRegistrationRequest, response: NextApiResponse) {
        if (!flags.registrationEnabled) {
            this.setInvalidRegistrationResponse(response, 403, 'Registration is disabled');
            return false;
        }

        if (flags.registrationByInvitationOnly && (!req.invitationCode || !flags.invitationCodes.includes(req.invitationCode))) {
            this.setInvalidRegistrationResponse(response, 400, 'Invalid invitation code');
            return false;
        }

        if (!req.email || !req.login || !req.password) {
            this.setInvalidRegistrationResponse(response, 400, 'Mandatory fields missed');
            return false;
        }

        if (!req.email.includes("@") || req.email.length > 100) {
            this.setInvalidRegistrationResponse(response, 400, 'Invalid email');
            return false;
        }

        if (req.login.length > 100 || !/^[a-zA-Z][a-zA-Z0-9_]+$/.test(req.login)) {
            this.setInvalidRegistrationResponse(response, 400, 'Invalid login');
            return false;
        }

        if (req.password.length > 255 || req.password.length < 8) {
            this.setInvalidRegistrationResponse(response, 400, 'Invalid password length');
            return false;
        }

        return true;
    }

    override async handlePOST(request: NextApiRequest, response: NextApiResponse): Promise<void> {
        const req = await request.body as IRegistrationRequest;

        if (!this.validateRegistrationRequest(req, response)) {
            return;
        }

        const sp = GetServiceProvider();

        const authService = await sp.resolve<IAuthService>("AuthService");

        // TODO: Add logging

        try {
            const result = await authService.registerUser(req.login, req.password, req.email);

            if (!result.success) {
                this.setInvalidRegistrationResponse(response, 400, result.errorMessage ?? 'Unknown error');
                return;
            }

            const res : IRegistrationResponse = {
                success: true
            };
            response.status(200).json(res);
        } catch (error) {
            this.setInvalidRegistrationResponse(response, 500, (error as { message : string })?.message ?? 'Unknown error');
            return;
        }
    }
}

export default async function registrationHandler(req: NextApiRequest, res: NextApiResponse) {
    const handler = new RegistrationHandler();
    await handler.handle(req, res);
}