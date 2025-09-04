import { Router } from 'express';
import lifeCheckRoutes from './life.route';
import WebhookRouter from './webhook.routes';

const router = Router();

router.use('/webhook', WebhookRouter);    
router.use('/life-check', lifeCheckRoutes);    

export default router;
