import { Analysis } from '../models/analysis.model';

export class AnalysisService {
    static async createAnalysis(analysisData: any): Promise<Analysis> {
        const analysis = await Analysis.create(analysisData);
        console.log(`Created analysis for session: ${analysisData.session_id}`);
        return analysis;
    }

    static async getAnalysisBySessionId(sessionId: string): Promise<Analysis | null> {
        return await Analysis.findOne({
            where: { session_id: sessionId }
        });
    }
}