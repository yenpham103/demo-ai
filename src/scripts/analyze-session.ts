import 'dotenv/config';
import { sequelize } from '../models';
import { OpenAIAnalysisService } from '../services/openai-analysis.service';

const analyzeSession = async (): Promise<void> => {
    try {
        const sessionId = process.argv[2];
        
        if (!sessionId) {
            console.error('❌ Please provide a session ID');
            console.log('Usage: npm run analyze:session <session_id>');
            process.exit(1);
        }
        
        console.log(`🤖 Analyzing session: ${sessionId}`);
        
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        await OpenAIAnalysisService.analyzeSession(sessionId);
        
        console.log('🎉 Session analysis completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Session analysis failed:', (error as Error).message);
        process.exit(1);
    }
};

if (require.main === module) {
    analyzeSession();
}