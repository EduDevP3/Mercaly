import { Router } from 'express';
import {
  getAllStores,
  createStoreWithAdmin,
  updateStoreSubscription,
  toggleKillSwitch,
  getPlatformMetrics,
  getDatabasesOverview,
  provisionTenantDatabase,
  impersonateStore,
} from '../controllers/superAdmin.Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de Super Admin requieren estrictamente el rol 'super_admin'
router.use(requireAuth(['super_admin']));

// Telemetría y Métricas Globales
router.get('/metrics', getPlatformMetrics);

// Gestión de Bases de Datos en MongoDB Atlas
router.get('/databases', getDatabasesOverview);
router.post('/databases/provision', provisionTenantDatabase);

// Gestión de Tenants
router.get('/stores', getAllStores);
router.get('/tenants', getAllStores);
router.post('/stores', createStoreWithAdmin);
router.patch('/stores/:id', updateStoreSubscription);
router.patch('/stores/:id/subscription', updateStoreSubscription);
router.patch('/stores/:id/kill-switch', toggleKillSwitch);
router.post('/stores/:id/impersonate', impersonateStore);

export default router;
