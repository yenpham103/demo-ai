import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller';

const router = Router();

router.get('/daily', InsightsController.getDailyInsights);

export default router;