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
    
    static async getDailyInsightsByDate(req: Request, res: Response): Promise<void> {
        try {
            const { date } = req.params;
            
            if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid date format. Use YYYY-MM-DD'
                });
                return;
            }
            
            const insights = await DailyInsightsService.generateDailyInsights(date);
            
            res.json({
                success: true,
                data: insights
            });
            
        } catch (error) {
            console.error('Error getting daily insights by date:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to get daily insights for specified date'
            });
        }
    }
}