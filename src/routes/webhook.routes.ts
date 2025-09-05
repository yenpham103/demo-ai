import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { verifyCrispSignature } from '../middlewares/verifyCrispSignature.middleware';

const router = Router();

router.post('/crisp', verifyCrispSignature, WebhookController.crispWebhook);

export default router;

