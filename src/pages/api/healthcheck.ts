import type { NextApiRequest, NextApiResponse } from 'next'
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import { GetServiceProvider } from "@/lib/service-provider";

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store';

async function handleGET(req: NextApiRequest, res: NextApiResponse) {

    const sp = GetServiceProvider();
    const userRepository = await sp.resolve<IUserRepository>("UserRepository");

    await userRepository.ping();

    res.status(200).json({ status: "ok" });
}

export default async function healthcheckHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            await handleGET(req, res);
        } else {
            res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        const message = (error as { message : string })?.message ?? 'Internal Server Error';
        const name = (error as { name : string })?.name ?? -1;
        res.status(500).json({ error: message, errorType: name });
    }
}