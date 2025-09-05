import { Op } from 'sequelize';
import { Session, Analysis } from '../models';

export class DailyInsightsService {
    static async generateDailyInsights(date?: string): Promise<any> {
        const targetDate = date ? new Date(date) : new Date();

        const startOfWorkDay = new Date(targetDate);
        startOfWorkDay.setDate(startOfWorkDay.getDate() - 1);
        startOfWorkDay.setHours(7, 0, 0, 0);

        const endOfWorkDay = new Date(targetDate);
        endOfWorkDay.setHours(7, 0, 0, 0);

        const sessions = await Session.findAll({
            where: {
                first_message_at: {
                    [Op.between]: [startOfWorkDay, endOfWorkDay]
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
                work_day: `${startOfWorkDay.toLocaleDateString()} 7AM - ${endOfWorkDay.toLocaleDateString()} 7AM`,
                total_conversations: 0,
                insights: 'No conversations found for this period'
            };
        }

        const analyzedSessions = sessions.filter(s => s.analysis);
        const resolvedSessions = sessions.filter(s => s.is_resolved);
        const withFiles = sessions.filter(s => s.has_files);

        const customerNeeds = this.extractCustomerNeeds(analyzedSessions);
        const topIssues = this.extractTopIssues(analyzedSessions);
        const moodAnalysis = this.analyzeMood(analyzedSessions);
        const recommendations = this.generateRecommendations(sessions, analyzedSessions);

        return {
            work_day: `${startOfWorkDay.toLocaleDateString()} 7AM - ${endOfWorkDay.toLocaleDateString()} 7AM`,
            summary: {
                total_conversations: sessions.length,
                resolved_conversations: resolvedSessions.length,
                analyzed_conversations: analyzedSessions.length,
                conversations_with_files: withFiles.length,
                resolution_rate: Math.round((resolvedSessions.length / sessions.length) * 100),
                avg_response_time_minutes: this.calculateAvgResponseTime(sessions)
            },
            customer_insights: {
                main_needs: customerNeeds,
                top_issues: topIssues,
                mood_distribution: moodAnalysis,
                satisfaction_avg: this.calculateAvgSatisfaction(analyzedSessions)
            },
            recommendations: recommendations
        };
    }

    private static extractCustomerNeeds(sessions: any[]): string[] {
        const allNeeds: string[] = [];

        sessions.forEach(session => {
            if (session.analysis?.customer_needs) {
                try {
                    const needs = JSON.parse(session.analysis.customer_needs);
                    allNeeds.push(...needs);
                } catch (e) { }
            }
        });

        const needsCounts = allNeeds.reduce((acc: any, need: string) => {
            acc[need] = (acc[need] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(needsCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([need]) => need);
    }

    private static extractTopIssues(sessions: any[]): string[] {
        const allIssues: string[] = [];

        sessions.forEach(session => {
            if (session.analysis?.technical_issues) {
                try {
                    const issues = JSON.parse(session.analysis.technical_issues);
                    allIssues.push(...issues);
                } catch (e) { }
            }
        });

        const issuesCounts = allIssues.reduce((acc: any, issue: string) => {
            acc[issue] = (acc[issue] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(issuesCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([issue]) => issue);
    }

    private static analyzeMood(sessions: any[]): any {
        const moodCounts: Record<string, number> = {};

        sessions.forEach(session => {
            if (session.analysis?.customer_mood) {
                const mood = session.analysis.customer_mood;
                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            }
        });

        return moodCounts;
    }

    private static calculateAvgSatisfaction(sessions: any[]): number {
        if (sessions.length === 0) return 0;

        const satisfactionSum = sessions.reduce((sum, session) => {
            return sum + (session.analysis?.satisfaction_level || 0);
        }, 0);

        return Math.round((satisfactionSum / sessions.length) * 100) / 100;
    }

    private static calculateAvgResponseTime(sessions: any[]): number {
        const responseTimes = sessions
            .filter(s => s.response_time_minutes)
            .map(s => s.response_time_minutes);

        if (responseTimes.length === 0) return 0;

        const sum = responseTimes.reduce((total, time) => total + time, 0);
        return Math.round(sum / responseTimes.length);
    }

    private static generateRecommendations(allSessions: any[], analyzedSessions: any[]): string[] {
        const recommendations: string[] = [];

        const resolutionRate = (allSessions.filter((s: any) => s.is_resolved).length / allSessions.length) * 100;
        const withFilesRate = (allSessions.filter((s: any) => s.has_files).length / allSessions.length) * 100;
        const avgSatisfaction = this.calculateAvgSatisfaction(analyzedSessions);

        if (resolutionRate < 70) {
            recommendations.push(`Low resolution rate (${Math.round(resolutionRate)}%). Review unresolved cases and improve escalation procedures.`);
        }

        if (withFilesRate > 50) {
            recommendations.push(`High file attachment rate (${Math.round(withFilesRate)}%). Issues often require visual explanation - improve documentation.`);
        }

        if (avgSatisfaction < 3) {
            recommendations.push(`Low customer satisfaction (${avgSatisfaction}/5). Review agent responses and training procedures.`);
        }

        const negativeCount = analyzedSessions.filter((s: any) =>
            s.analysis?.customer_mood === 'frustrated' || s.analysis?.customer_mood === 'angry'
        ).length;

        if (negativeCount > analyzedSessions.length * 0.3) {
            recommendations.push(`High negative sentiment detected. Review escalation procedures and agent empathy training.`);
        }

        if (recommendations.length === 0) {
            recommendations.push('Overall performance looks good. Continue monitoring trends and maintaining quality standards.');
        }

        return recommendations;
    }
}