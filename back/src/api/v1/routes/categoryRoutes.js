import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/category.Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { resolveTenant } from '../middlewares/tenantMiddleware.js';

const router = Router();

// Validation chain for creating/updating a category
const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es obligatorio.')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres.')
];

// Rutas de consulta (con resolución de tenant o autenticación)
router.get('/', resolveTenant, getAllCategories);
router.get('/:id', resolveTenant, getCategoryById);

// Rutas administrativas (Scoped a la tienda del usuario autenticado)
router.post('/', requireAuth(['store_admin', 'super_admin']), categoryValidationRules, createCategory);
router.put('/:id', requireAuth(['store_admin', 'super_admin']), categoryValidationRules, updateCategory);
router.delete('/:id', requireAuth(['store_admin', 'super_admin']), deleteCategory);

export default router;
