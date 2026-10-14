import { Router } from 'express';
import authRoutes from './authRoutes.js';
import clientAuthRoutes from './clientAuth.Routes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import clientRoutes from './clientRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import superAdminRoutes from './superAdminRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import config from '../../../config/config.js';

const routerAPI = (app) => {
  const router = Router();
  const api = config.API_URL;

  // Mount at both the configured prefix and root for resilience in production
  app.use([api, '/'], router);

  router.use('/auth', authRoutes);
  router.use('/client/auth', clientAuthRoutes);
  router.use('/products', productRoutes);
  router.use('/categories', categoryRoutes);
  router.use('/orders', orderRoutes);
  router.use('/clients', clientRoutes);
  router.use('/admin/subscription', subscriptionRoutes);
  router.use('/admin/analytics', analyticsRoutes);
  router.use('/super-admin', superAdminRoutes);

  return router;
};

export default routerAPI;
