import { Router } from 'express';
import lifeCheckRoutes from './life.route';
import crispRoutes from './crisp.route';

const router = Router();

router.use('/crisp', crispRoutes);    
router.use('/life-check', lifeCheckRoutes);    

export default router;
