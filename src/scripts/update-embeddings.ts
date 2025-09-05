import 'dotenv/config';
import { sequelize } from '../models';
import { VectorService } from '../services/vector.service';

const updateEmbeddings = async (): Promise<void> => {
    try {
        const batchSize = parseInt(process.argv[2] || '20');
        
        console.log('🚀 Starting embedding update process...');
        console.log(`📊 Processing ${batchSize} records per batch`);
        
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        await VectorService.updateMissingEmbeddings(batchSize);
        
        console.log('🎉 Embedding update completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Embedding update failed:', (error as Error).message);
        process.exit(1);
    }
};

if (require.main === module) {
    updateEmbeddings();
}