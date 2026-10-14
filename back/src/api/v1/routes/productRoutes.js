import { Router } from 'express';
import { 
    getProducts, 
    getProductById, 
    getAllProductsSimple,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { resolveTenant } from '../middlewares/tenantMiddleware.js';
import { uploadSingleImage } from '../middlewares/multer.middleware.js';

const router = Router();

// --- Rutas Públicas de Catálogo (Resuelven Tenant y validan vigencia de suscripción) ---
router.get('/', resolveTenant, getProducts);
router.get('/simple', resolveTenant, getAllProductsSimple);
router.get('/:id', resolveTenant, getProductById);

// --- Rutas de Gestión Administrativa (Scoped a storeId del usuario autenticado) ---
router.post(
    '/', 
    [requireAuth(['store_admin', 'super_admin']), uploadSingleImage], 
    createProduct
);

router.put(
    '/:id', 
    [requireAuth(['store_admin', 'super_admin']), uploadSingleImage], 
    updateProduct
);

router.delete(
    '/:id', 
    [requireAuth(['store_admin', 'super_admin'])], 
    deleteProduct
);

export default router;
