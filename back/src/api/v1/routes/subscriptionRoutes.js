import { Router } from 'express';
import { getSubscriptionStatus } from '../controllers/subscription.Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoint de autoservicio para Store Admins (y Super Admins)
router.get('/status', requireAuth(['store_admin', 'super_admin']), getSubscriptionStatus);

export default router;
