import express from 'express';
import type { Router } from 'express';
import { requireAuth } from '@/middleware/authMiddleware.js';
import { getByContract, getModelPerformance } from './analyticsController.js';

const router: Router = express.Router();

router.get(
   '/model-performance',
   requireAuth,
   getModelPerformance,
);

router.get(
   '/by-contract',
   requireAuth,
   getByContract,
);

export default router;
