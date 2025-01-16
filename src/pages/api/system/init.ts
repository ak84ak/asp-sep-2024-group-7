import BaseApiHandler from "@/lib/api-base/BaseApiHandler";
import type {NextApiRequest, NextApiResponse} from "next";
import {GetServiceProvider} from "@/lib/service-provider";
import ISbInitService from "@/lib/services/ISbInitService";

if (!process.env.SB_INIT_TOKEN) {
    throw new Error('SB_INIT_TOKEN is not defined');
}

class SystemInitHandler extends BaseApiHandler {
    handlerName: string = "SystemInitHandler";

    override canHandlePOST: boolean = true;

    override async handlePOST(request: NextApiRequest, response: NextApiResponse): Promise<void> {
        const sp = GetServiceProvider();
        const initService = await sp.resolve<ISbInitService>("SbInitService");

        await initService.init();

        response.status(200).json({ success: true });
    }
}

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.headers["x-sb-init-token"] !== process.env.SB_INIT_TOKEN) {
        res.status(403).json({ error: 'Forbidden', errorType: 'Forbidden' });
        return;

    }
    const handler = new SystemInitHandler();
    await handler.handle(req, res);
}