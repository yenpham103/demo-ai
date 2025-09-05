import { Session } from '../models/sessions.model';

export class SessionService {
    static async upsertSession(sessionData: any): Promise<Session> {
        const [session, created] = await Session.upsert(sessionData, {
            returning: true
        });

        if (created) {
            console.log(`Created session: ${sessionData.session_id}`);
        } else {
            console.log(`Updated session: ${sessionData.session_id}`);
        }

        return session;
    }

    static async getSessionBySessionId(sessionId: string): Promise<Session | null> {
        return await Session.findOne({
            where: { session_id: sessionId }
        });
    }

    static async getUnanalyzedSessions(limit: number = 20): Promise<Session[]> {
        return await Session.findAll({
            where: { ai_analyzed: false },
            limit,
            order: [['last_message_at', 'DESC']]
        });
    }

    static async updateSessionAnalysis(sessionId: string, analysisData: any): Promise<void> {
        await Session.update({
            ai_analyzed: true,
            ai_summary: analysisData.conversation_summary,
            category: analysisData.category,
            customer_sentiment: analysisData.customer_sentiment,
            urgency_score: analysisData.urgency_score
        }, {
            where: { session_id: sessionId }
        });
    }
}