import { Router } from 'express';
import lifeCheckRoutes from './life.route';
import webhookRouter from './webhook.routes';
import vectorRoutes from './vector.routes';

const router = Router();

router.use('/webhook', webhookRouter);    
router.use('/vector', vectorRoutes);
router.use('/life-check', lifeCheckRoutes);    

export default router;
