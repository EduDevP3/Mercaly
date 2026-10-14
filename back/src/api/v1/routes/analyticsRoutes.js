import { Router } from 'express';
import { getStoreAnalytics, trackCatalogEvent } from '../controllers/analytics.Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Consulta de analíticas del store admin (o super_admin)
router.get('/', requireAuth(['store_admin', 'super_admin']), getStoreAnalytics);

// Registro de eventos de interacción (público para la tienda)
router.post('/track', trackCatalogEvent);

export default router;
