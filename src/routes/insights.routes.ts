import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller';

const router = Router();

router.get('/daily', InsightsController.getDailyInsights);
router.get('/daily/:date', InsightsController.getDailyInsightsByDate);

export default router;