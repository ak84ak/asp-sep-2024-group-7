import {NextApiRequest, NextApiResponse} from "next";

export default abstract class BaseApiHandler {
    abstract handlerName: string;
    protected canHandleGET = false;
    protected canHandlePOST = false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleGET(request: NextApiRequest, response: NextApiResponse): Promise<void> {
        throw new Error(`${this.handlerName}: Handle GET should be implemented in derived classes`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handlePOST(request: NextApiRequest, response: NextApiResponse): Promise<void> {
        throw new Error(`${this.handlerName}: Handle POST should be implemented in derived classes`);
    }

    async handle(req: NextApiRequest, res: NextApiResponse) {
        try {
            if (req.method === 'GET' && this.canHandleGET) {
                await this.handleGET(req, res);
            } else if (req.method === 'POST' && this.canHandlePOST) {
                await this.handlePOST(req, res);
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