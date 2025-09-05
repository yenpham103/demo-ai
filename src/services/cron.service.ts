import cron from 'node-cron';
import { DailyInsightsService } from './daily-insights.service';
import { OpenAIAnalysisService } from './openai-analysis.service';

export class CronService {
    static startDailyInsights(): void {
        cron.schedule('30 7 * * *', async () => {
            try {
                console.log('Starting daily insights generation at 7:30 AM...');

                const insights = await DailyInsightsService.generateDailyInsights();

                console.log('Daily Insights Generated:');
                console.log(`Work Period: ${insights.work_day}`);
                console.log(`Total Conversations: ${insights.summary.total_conversations}`);
                console.log(`Resolution Rate: ${insights.summary.resolution_rate}%`);
                console.log(`Average Satisfaction: ${insights.customer_insights.satisfaction_avg}/5`);

                if (insights.customer_insights.main_needs.length > 0) {
                    console.log('Top Customer Needs:');
                    insights.customer_insights.main_needs.slice(0, 3).forEach((need: string, index: number) => {
                        console.log(`  ${index + 1}. ${need}`);
                    });
                }

                if (insights.recommendations.length > 0) {
                    console.log('Recommendations:');
                    insights.recommendations.forEach((rec: string) => {
                        console.log(`  - ${rec}`);
                    });
                }

            } catch (error) {
                console.error('Daily insights generation failed:', (error as Error).message);
            }
        }, {
            timezone: 'Asia/Ho_Chi_Minh'
        });

        console.log('Daily insights cron job scheduled at 7:30 AM (GMT+7)');
    }

    static startBatchAnalysis(): void {
        cron.schedule('0 * * * *', async () => {
            try {
                console.log('Running hourly batch AI analysis...');
                await OpenAIAnalysisService.batchAnalyzeUnprocessedSessions(50);
            } catch (error) {
                console.error('Batch analysis failed:', (error as Error).message);
            }
        });

        console.log('Batch AI analysis cron job scheduled every hour');
    }

    static startAllCronJobs(): void {
        this.startDailyInsights();
        this.startBatchAnalysis();
        console.log('All cron jobs started successfully');
    }
}