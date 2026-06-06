import express from 'express';
import type { Router } from 'express';
import { requireAuth } from '@/middleware/authMiddleware.js';
import { requirePermission } from '@/middleware/permissionMiddleware.js';
import { listAgents } from './userController.js';

const router: Router = express.Router();

router.get(
   '/agents',
   requireAuth,
   requirePermission('assign_interventions'),
   listAgents,
);

export default router;
