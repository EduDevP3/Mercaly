import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/order.Controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authenticateClientToken } from '../middlewares/clientAuthMiddleware.js';
import { orderLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Creación de pedidos: requiere autenticación de cliente y está protegida contra spam
router.post('/', authenticateClientToken, orderLimiter, createOrder);

// Gestión de pedidos administrativa
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrder);

export default router;
