import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const verifyCrispSignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const timestamp = req.headers['x-crisp-request-timestamp'] as string;
    const signature = req.headers['x-crisp-signature'] as string;
    const body = req.body;

    if (!process.env.CRISP_WEBHOOK_SECRET || !signature || !timestamp) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
    }

    try {
        const payload = `[${timestamp};${JSON.stringify(body)}]`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CRISP_WEBHOOK_SECRET)
            .update(payload, 'utf8')
            .digest('hex');

        const isValidSignature = crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );

        if (!isValidSignature) {
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = Math.floor(parseInt(timestamp) / 1000);
    const timeDiff = Math.abs(currentTime - requestTime);

    if (timeDiff > 1800) {
        res.status(400).json({ error: 'Timestamp too old' });
        return;
    }

    next();
};