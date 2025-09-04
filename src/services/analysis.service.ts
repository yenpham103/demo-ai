import { Analysis } from '../models/analysis.model';

export class AnalysisService {
    static async createAnalysis(analysisData: any): Promise<Analysis> {
        try {
            const analysis = await Analysis.create(analysisData);
            console.log(`✅ Created analysis for session: ${analysisData.session_id}`);
            return analysis;
        } catch (error) {
            console.error('❌ Error creating analysis:', (error as Error).message);
            throw error;
        }
    }

    static async getAnalysisBySessionId(sessionId: string): Promise<Analysis | null> {
        try {
            return await Analysis.findOne({
                where: { session_id: sessionId }
            });
        } catch (error) {
            console.error('❌ Error getting analysis:', (error as Error).message);
            throw error;
        }
    }

    static async getAllAnalyses(limit?: number, offset?: number): Promise<Analysis[]> {
        try {
            return await Analysis.findAll({
                limit: limit || 50,
                offset: offset || 0,
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.error('❌ Error getting analyses:', (error as Error).message);
            throw error;
        }
    }

    static async updateAnalysis(sessionId: string, updateData: any): Promise<void> {
        try {
            await Analysis.update(updateData, {
                where: { session_id: sessionId }
            });
            console.log(`✅ Updated analysis for session: ${sessionId}`);
        } catch (error) {
            console.error('❌ Error updating analysis:', (error as Error).message);
            throw error;
        }
    }
}