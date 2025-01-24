import {NextApiRequest, NextApiResponse} from "next";
import {GetServiceProvider} from "@/lib/service-provider";
import IAuthService from "@/lib/services/IAuthService";
import IAuthUser from "@/models/api-internal/IAuthUser";

export default abstract class BaseApiHandler {
    abstract handlerName: string;
    protected canHandleGET = false;
    protected canHandlePOST = false;
    protected canHandlePUT = false;
    protected canHandleDELETE = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleGET(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        throw new Error(`${this.handlerName}: Handle GET should be implemented in derived classes`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handlePOST(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        throw new Error(`${this.handlerName}: Handle POST should be implemented in derived classes`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handlePUT(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        throw new Error(`${this.handlerName}: Handle POST should be implemented in derived classes`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleDELETE(request: NextApiRequest, response: NextApiResponse, user?: IAuthUser): Promise<void> {
        throw new Error(`${this.handlerName}: Handle POST should be implemented in derived classes`);
    }

    async handle(req: NextApiRequest, res: NextApiResponse, requiresAuth: boolean, options?: { disableGETCache: boolean }): Promise<void> {
        let user: IAuthUser | undefined = undefined;
        if (requiresAuth) {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({error: 'Unauthorized'});
                return;
            }

            const sp = GetServiceProvider();
            const authService = await sp.resolve<IAuthService>("AuthService");

            const token = authHeader.split(' ')[1];
            try {
                user = await authService.getUserFromToken(token);
            } catch (error) {
                console.log(error);
                res.status(401).json({error: 'Unauthorized'});
                return;
            }
        }

        try {
            if (req.method === 'GET' && this.canHandleGET) {
                if (options?.disableGETCache) {
                    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                }

                await this.handleGET(req, res, user);
            } else if (req.method === 'POST' && this.canHandlePOST) {
                await this.handlePOST(req, res, user);
            } else if (req.method === 'PUT' && this.canHandlePUT) {
                await this.handlePUT(req, res, user);
            } else if (req.method === 'DELETE' && this.canHandleDELETE) {
                await this.handleDELETE(req, res, user);
            } else {
                res.status(405).json({ error: 'Method Not Allowed' });
            }
        } catch (error) {
            const message = (error as { message : string })?.message ?? 'Internal Server Error';
            const name = (error as { name : string })?.name ?? -1;
            res.status(500).json({ error: message, errorType: name });
        }
    }
}