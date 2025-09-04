import express from 'express';
import { crispWebhook } from 'src/controllers/crisp.controller';

const router = express.Router();

router.post('/webhook', crispWebhook);
export default router;