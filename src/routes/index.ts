import { Router } from 'express';
import webhookRoutes from './webhook.routes';
import insightsRoutes from './insights.routes';
import lifeCheckRoutes from './insights.routes';

const router = Router();

router.use('/webhook', webhookRoutes);
router.use('/insights', insightsRoutes);
router.get('/health', lifeCheckRoutes);

export default router;