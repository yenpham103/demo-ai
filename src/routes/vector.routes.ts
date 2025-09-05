import { Router } from 'express';
import { VectorController } from '../controllers/vector.controller';

const router = Router();

router.get('/similar-conversations/:sessionId', VectorController.findSimilarConversations);
router.get('/similar-customers/:customerKey', VectorController.findSimilarCustomers);
router.post('/semantic-search', VectorController.semanticSearch);
router.get('/conversation-clusters', VectorController.getConversationClusters);
router.post('/update-embeddings', VectorController.updateMissingEmbeddings);

export default router;