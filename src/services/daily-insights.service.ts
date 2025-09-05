import { Op } from 'sequelize';
import { Session, Analysis } from '../models';

export class DailyInsightsService {
    static async generateDailyInsights(): Promise<any> {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startTime = new Date(yesterday);
        startTime.setHours(7, 0, 0, 0);

        const endTime = new Date(today);
        endTime.setHours(7, 0, 0, 0);

        console.log(`📊 Generating insights for period: ${startTime.toISOString()} to ${endTime.toISOString()}`);

        const sessions = await Session.findAll({
            where: {
                first_message_at: {
                    [Op.gte]: startTime,
                    [Op.lt]: endTime
                }
            },
            include: [{
                model: Analysis,
                as: 'analysis',
                required: false
            }]
        });

        if (sessions.length === 0) {
            return {
                work_day: yesterday.toISOString().split('T')[0],
                summary: {
                    total_conversations: 0,
                    resolution_rate: 0,
                    avg_response_time: 0
                },
                customer_insights: {
                    main_needs: [],
                    pain_points: [],
                    satisfaction_avg: 0,
                    mood_distribution: {}
                },
                recommendations: ['No conversations found for this period']
            };
        }

        const totalConversations = sessions.length;
        const resolvedConversations = sessions.filter(s => s.is_resolved).length;
        const resolutionRate = (resolvedConversations / totalConversations) * 100;

        const responseTimes = sessions
            .filter(s => s.response_time_minutes !== null)
            .map(s => s.response_time_minutes!);
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        const analyzedSessions = sessions.filter(s => s.analysis);
        const allNeeds: string[] = [];
        const allPainPoints: string[] = [];
        const satisfactionLevels: number[] = [];
        const moods: string[] = [];

        analyzedSessions.forEach(session => {
            const analysis = session.analysis;
            if (analysis) {
                try {
                    const needs = JSON.parse(analysis.customer_needs);
                    const painPoints = JSON.parse(analysis.pain_points);

                    allNeeds.push(...needs);
                    allPainPoints.push(...painPoints);
                    satisfactionLevels.push(analysis.satisfaction_level);
                    moods.push(analysis.customer_mood);
                } catch (error) {
                    console.error('Error parsing analysis data:', error);
                }
            }
        });

        const needCounts = this.countFrequency(allNeeds);
        const painPointCounts = this.countFrequency(allPainPoints);
        const moodCounts = this.countFrequency(moods);

        const avgSatisfaction = satisfactionLevels.length > 0
            ? satisfactionLevels.reduce((a, b) => a + b, 0) / satisfactionLevels.length
            : 0;

        const recommendations = this.generateRecommendations({
            resolutionRate,
            avgResponseTime,
            avgSatisfaction,
            topPainPoints: Object.keys(painPointCounts).slice(0, 3),
            totalConversations
        });

        return {
            work_day: yesterday.toISOString().split('T')[0],
            period: {
                start: startTime.toISOString(),
                end: endTime.toISOString()
            },
            summary: {
                total_conversations: totalConversations,
                analyzed_conversations: analyzedSessions.length,
                resolution_rate: Math.round(resolutionRate * 100) / 100,
                avg_response_time: Math.round(avgResponseTime * 100) / 100
            },
            customer_insights: {
                main_needs: Object.keys(needCounts).slice(0, 10),
                pain_points: Object.keys(painPointCounts).slice(0, 10),
                satisfaction_avg: Math.round(avgSatisfaction * 100) / 100,
                mood_distribution: moodCounts
            },
            recommendations
        };
    }

    private static countFrequency(items: string[]): Record<string, number> {
        const counts: Record<string, number> = {};
        items.forEach(item => {
            if (item && item.trim()) {
                const normalized = item.trim().toLowerCase();
                counts[normalized] = (counts[normalized] || 0) + 1;
            }
        });

        return Object.fromEntries(
            Object.entries(counts).sort(([, a], [, b]) => b - a)
        );
    }

    private static generateRecommendations(metrics: any): string[] {
        const recommendations: string[] = [];

        if (metrics.resolutionRate

            < 80) { recommendations.push(`Resolution rate is low at ${metrics.resolutionRate}%. Consider reviewing unresolved tickets and providing additional agent training.`); } if (metrics.avgResponseTime > 60) {
                recommendations.push(`Average response time is ${Math.round(metrics.avgResponseTime)} minutes. Consider staffing adjustments during peak hours.`);
            }

        if (metrics.avgSatisfaction

            < 3.5) { recommendations.push(`Customer satisfaction is below average (${metrics.avgSatisfaction}/5). Review and address top pain points.`); } if (metrics.topPainPoints.length > 0) {
                recommendations.push(`Top customer concerns: ${metrics.topPainPoints.join(', ')}. Consider creating FAQ or process improvements.`);
            }

        if (metrics.totalConversations === 0) {
            recommendations.push('No customer conversations recorded. Check webhook integration and data collection.');
        }

        if (recommendations.length === 0) {
            recommendations.push('Performance metrics are within acceptable ranges. Continue monitoring trends.');
        }

        return recommendations;
    }
}