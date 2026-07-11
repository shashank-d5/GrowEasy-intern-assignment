import { Router } from 'express';
import { handleImport } from '../controllers/importController';
import { importLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', importLimiter, handleImport);

export default router;
