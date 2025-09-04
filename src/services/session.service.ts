import { Session } from '../models/sessions.model';

export class SessionService {
    static async upsertSession(sessionData: any): Promise<Session> {
        try {
            const [session, created] = await Session.upsert(sessionData, {
                returning: true
            });

            if (created) {
                console.log(`✅ Created new session: ${sessionData.session_id}`);
            } else {
                console.log(`📝 Updated session: ${sessionData.session_id}`);
            }

            return session;
        } catch (error) {
            console.error('❌ Error upserting session:', (error as Error).message);
            throw error;
        }
    }

    static async getSessionBySessionId(sessionId: string): Promise<Session | null> {
        try {
            return await Session.findOne({
                where: { session_id: sessionId }
            });
        } catch (error) {
            console.error('❌ Error getting session:', (error as Error).message);
            throw error;
        }
    }

    static async getAllSessions(limit?: number, offset?: number): Promise<Session[]> {
        try {
            return await Session.findAll({
                limit: limit || 50,
                offset: offset || 0,
                order: [['last_message_at', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error getting sessions:', (error as Error).message);
            throw error;
        }
    }

    static async getUnanalyzedSessions(limit?: number): Promise<Session[]> {
        try {
            return await Session.findAll({
                where: { 
                    ai_analyzed: false 
                },
                limit: limit || 20,
                order: [['last_message_at', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error getting unanalyzed sessions:', (error as Error).message);
            throw error;
        }
    }

    static async updateSessionAnalysis(sessionId: string, analysisData: any): Promise<void> {
        try {
            await Session.update({
                ai_analyzed: true,
                ai_summary: analysisData.conversation_summary,
                category: analysisData.category,
                customer_sentiment: analysisData.customer_sentiment,
                urgency_score: analysisData.urgency_score
            }, {
                where: { session_id: sessionId }
            });

            console.log(`✅ Updated session analysis: ${sessionId}`);
        } catch (error) {
            console.error('❌ Error updating session analysis:', (error as Error).message);
            throw error;
        }
    }
}