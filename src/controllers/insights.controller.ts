import { Request, Response } from 'express';
import { DailyInsightsService } from '../services/daily-insights.service';

export class InsightsController {
    static async getDailyInsights(req: Request, res: Response): Promise<void> {
        try {
            const insights = await DailyInsightsService.generateDailyInsights();
            
            res.json({
                success: true,
                data: insights
            });
            
        } catch (error) {
            console.error('Error getting daily insights:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to get daily insights'
            });
        }
    }
    
}