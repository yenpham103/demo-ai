import { Request, Response } from 'express';
import { processMessage } from '../utils/conversation.utils';
import { CRISP_TOPIC } from '../constants/rabbitmq.constant';

export class WebhookController {
    static async handleCrispWebhook(req: Request, res: Response): Promise<void> {
        try {
            const { event, data } = req.body;

            if (CRISP_TOPIC.includes(event)) {
                await processMessage(data);
            } else {
                console.info({
                    level: "info",
                    location: "controllers/webhook/handleCrispWebhook",
                    message: `[CRISP WEBHOOK] Unknown event: ${event}`
                });
            }

            res.status(200).json({ status: 'received' });

        } catch (error) {
            console.error('[CRISP WEBHOOK] Error:', (error as Error).message);
            res.status(500).json({ error: 'Processing failed' });
        }
    }
}