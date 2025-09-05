import { Request, Response } from 'express';
import { VectorService } from '../services/vector.service';

export class VectorController {
    
    static async findSimilarConversations(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            const limit = parseInt(req.query.limit as string) || 5;
            
            const similarConversations = await VectorService.findSimilarConversations(sessionId, limit);
            
            res.json({
                success: true,
                data: similarConversations,
                total: similarConversations.length
            });
            
        } catch (error) {
            console.error('❌ Error finding similar conversations:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to find similar conversations'
            });
        }
    }
    
    static async findSimilarCustomers(req: Request, res: Response): Promise<void> {
        try {
            const { customerKey } = req.params;
            const limit = parseInt(req.query.limit as string) || 5;
            
            const similarCustomers = await VectorService.findSimilarCustomers(customerKey, limit);
            
            res.json({
                success: true,
                data: similarCustomers,
                total: similarCustomers.length
            });
            
        } catch (error) {
            console.error('❌ Error finding similar customers:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to find similar customers'
            });
        }
    }
    
    static async semanticSearch(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.body;
            const limit = parseInt(req.body.limit) || 10;
            
            if (!query || typeof query !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Query text is required'
                });
                return;
            }
            
            const results = await VectorService.semanticSearch(query, limit);
            
            res.json({
                success: true,
                data: results,
                total: results.length,
                query: query
            });
            
        } catch (error) {
            console.error('❌ Error in semantic search:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to perform semantic search'
            });
        }
    }
    
    static async getConversationClusters(req: Request, res: Response): Promise<void> {
        try {
            const minSimilarity = parseFloat(req.query.minSimilarity as string) || 0.8;
            
            const clusters = await VectorService.getConversationClusters(minSimilarity);
            
            res.json({
                success: true,
                data: clusters,
                total: clusters.length,
                minSimilarity
            });
            
        } catch (error) {
            console.error('❌ Error getting conversation clusters:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to get conversation clusters'
            });
        }
    }
    
    static async updateMissingEmbeddings(req: Request, res: Response): Promise<void> {
        try {
            const batchSize = parseInt(req.body.batchSize) || 20;
            
            await VectorService.updateMissingEmbeddings(batchSize);
            
            res.json({
                success: true,
                message: 'Missing embeddings update completed'
            });
            
        } catch (error) {
            console.error('❌ Error updating missing embeddings:', (error as Error).message);
            res.status(500).json({
                success: false,
                error: 'Failed to update missing embeddings'
            });
        }
    }
}