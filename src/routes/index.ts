import { Router } from 'express';
import webhookRoutes from './webhook.routes';
import insightsRoutes from './insights.routes';

const router = Router();

router.use('/webhook', webhookRoutes);
router.use('/insights', insightsRoutes);

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'tb-customers-ai'
    });
});

router.get('/stats', async (req, res) => {
    try {
        const { Session, Analysis } = await import('../models');

        const totalSessions = await Session.count();
        const analyzedSessions = await Session.count({ where: { ai_analyzed: true } });
        const totalAnalyses = await Analysis.count();

        res.json({
            success: true,
            data: {
                total_sessions: totalSessions,
                analyzed_sessions: analyzedSessions,
                total_analyses: totalAnalyses,
                pending_analysis: totalSessions - analyzedSessions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get stats'
        });
    }
});

export default router;