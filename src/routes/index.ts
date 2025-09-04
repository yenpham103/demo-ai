import { Router } from 'express';
import openaiRoutes from './openai.route';
import lifeCheckRoutes from './life.route';
import rembgRoutes from './rembg.route';
import userRoutes from './user.route';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authenticateIP } from '../middlewares/ip.middleware';

const router = Router();

router.use('/openai', authenticateIP, authenticateJWT, openaiRoutes);    
router.use('/rembg', authenticateIP, authenticateJWT, rembgRoutes);    
router.use('/user', authenticateIP, authenticateJWT, userRoutes);    
router.use('/life-check', lifeCheckRoutes);    

export default router;
