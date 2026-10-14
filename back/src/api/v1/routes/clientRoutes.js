import { Router } from 'express';
import { body } from 'express-validator';
import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
} from '../controllers/client.Controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

const clientValidationRules = [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('phone').notEmpty().withMessage('Phone number is required.'),
];

router.use(authenticateToken);

router.post('/', clientValidationRules, createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', clientValidationRules, updateClient);
router.delete('/:id', deleteClient);

export default router;
