import 'dotenv/config';
import { sequelize } from '../models';
import { OpenAIAnalysisService } from '../services/openai-analysis.service';

const runBatchAnalysis = async (): Promise<void> => {
    try {
        console.log('🚀 Starting batch AI analysis...');
        
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        const batchSize = parseInt(process.argv[2] || '10');
        console.log(`📊 Processing ${batchSize} sessions per batch`);
        
        await OpenAIAnalysisService.batchAnalyzeUnprocessedSessions(batchSize);
        
        console.log('🎉 Batch analysis completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Batch analysis failed:', (error as Error).message);
        process.exit(1);
    }
};

if (require.main === module) {
    runBatchAnalysis();
}