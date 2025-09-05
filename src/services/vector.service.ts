import { Op, QueryTypes } from 'sequelize';
import { Analysis } from '../models/analysis.model';
import { OpenAIAnalysisService } from './openai-analysis.service';
import { CustomerProfile } from 'src/models/customers.model';

export class VectorService {
    static async findSimilarConversations(sessionId: string, limit: number = 5): Promise<any[]> {
        try {
            console.log(`🔍 Searching for conversations similar to session: ${sessionId}`);

            const similarConversations = await Analysis.findSimilar(sessionId, limit);

            console.log(`✅ Found ${similarConversations.length} similar conversations`);
            return similarConversations.map(conv => ({
                session_id: conv.session_id,
                conversation_summary: conv.conversation_summary,
                customer_mood: conv.customer_mood,
                main_topics: JSON.parse(conv.main_topic || '[]'),
                similarity_score: Math.round(conv.similarity_score * 100) / 100
            }));

        } catch (error) {
            console.error('❌ Error finding similar conversations:', (error as Error).message);
            throw error;
        }
    }

    static async findSimilarCustomers(customerKey: string, limit: number = 5): Promise<any[]> {
        try {
            console.log(`🔍 Searching for customers similar to: ${customerKey}`);

            const similarCustomers = await CustomerProfile.findSimilarCustomers(customerKey, limit);

            console.log(`✅ Found ${similarCustomers.length} similar customers`);
            return similarCustomers.map(customer => ({
                customer_key: customer.customer_key,
                primary_nickname: customer.primary_nickname,
                behavior_pattern: customer.behavior_pattern,
                total_sessions: customer.total_sessions,
                overall_satisfaction: customer.overall_satisfaction,
                similarity_score: Math.round(customer.similarity_score * 100) / 100
            }));

        } catch (error) {
            console.error('❌ Error finding similar customers:', (error as Error).message);
            throw error;
        }
    }

    static async semanticSearch(queryText: string, limit: number = 10): Promise<any[]> {
        try {
            console.log(`🔍 Performing semantic search for: "${queryText}"`);

            const queryEmbedding = await OpenAIAnalysisService.generateEmbedding(queryText);

            const results = await Analysis.sequelize!.query(`
                SELECT 
                    session_id,
                    conversation_summary,
                    customer_mood,
                    main_topic,
                    1 - (summary_embedding <=> :queryVector) as similarity_score
                FROM analyses
                WHERE summary_embedding IS NOT NULL
                ORDER BY summary_embedding <=> :queryVector
                LIMIT :limit
            `, {
                replacements: {
                    queryVector: JSON.stringify(queryEmbedding),
                    limit
                },
                type: QueryTypes.SELECT
            });

            console.log(`✅ Found ${results.length} semantically similar conversations`);
            return results.map((result: any) => ({
                ...result,
                main_topics: JSON.parse(result.main_topic || '[]'),
                similarity_score: Math.round(result.similarity_score * 100) / 100
            }));

        } catch (error) {
            console.error('❌ Error in semantic search:', (error as Error).message);
            throw error;
        }
    }

    static async getConversationClusters(minSimilarity: number = 0.8): Promise<any[]> {
        try {
            console.log('🔍 Analyzing conversation clusters...');

            const results = await Analysis.sequelize!.query(`
                WITH similarity_pairs AS (
                    SELECT 
                        a1.session_id as session_1,
                        a2.session_id as session_2,
                        a1.conversation_summary as summary_1,
                        a2.conversation_summary as summary_2,
                        a1.customer_mood as mood_1,
                        a2.customer_mood as mood_2,
                        1 - (a1.summary_embedding <=> a2.summary_embedding) as similarity
                    FROM analyses a1
                    CROSS JOIN analyses a2
                    WHERE a1.id < a2.id
                      AND a1.summary_embedding IS NOT NULL
                      AND a2.summary_embedding IS NOT NULL
                      AND 1 - (a1.summary_embedding <=> a2.summary_embedding) > :minSimilarity
                )
                SELECT * FROM similarity_pairs
                ORDER BY similarity DESC
                LIMIT 50
            `, {
                replacements: { minSimilarity },
                type: QueryTypes.SELECT
            });

            console.log(`✅ Found ${results.length} conversation clusters`);
            return results.map((cluster: any) => ({
                ...cluster,
                similarity_score: Math.round(cluster.similarity * 100) / 100
            }));

        } catch (error) {
            console.error('❌ Error analyzing conversation clusters:', (error as Error).message);
            throw error;
        }
    }

    static async updateMissingEmbeddings(batchSize: number = 20): Promise<void> {
        try {
            console.log('🚀 Updating missing embeddings...');

            const analysesWithoutEmbeddings = await Analysis.findAll({
                where: {
                    summary_embedding: { [Op.is]: null },
                    conversation_summary: { [Op.ne]: '' },
                },
                limit: batchSize,
            });


            if (analysesWithoutEmbeddings.length === 0) {
                console.log('ℹ️ No analyses missing embeddings');
                return;
            }

            console.log(`📊 Updating ${analysesWithoutEmbeddings.length} missing embeddings`);

            for (const analysis of analysesWithoutEmbeddings) {
                try {
                    const embedding = await OpenAIAnalysisService.generateEmbedding(
                        analysis.conversation_summary
                    );

                    await analysis.update({
                        summary_embedding: embedding
                    });

                    console.log(`✅ Updated embedding for session: ${analysis.session_id}`);

                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (error) {
                    console.error(`❌ Failed to update embedding for ${analysis.session_id}:`, error);
                }
            }

            console.log('🎉 Missing embeddings update completed');

        } catch (error) {
            console.error('❌ Error updating missing embeddings:', (error as Error).message);
            throw error;
        }
    }
}