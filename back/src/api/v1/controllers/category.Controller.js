import * as CategoryService from '../services/category.Service.js';
import { validationResult } from 'express-validator';

export const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const storeId = req.user && req.user.storeId;
    if (!storeId && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'No tienes una tienda asignada para crear categorías.' });
    }

    const newCategory = await CategoryService.createCategoryService(req.body, storeId);
    return res.status(201).json(newCategory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    // Si viene autenticado como store_admin, usar su storeId; si es consulta pública, usar req.store
    let storeId = null;
    if (req.user && req.user.storeId) {
      storeId = req.user.storeId;
    } else if (req.store) {
      storeId = req.store._id;
    } else if (req.query.storeId) {
      storeId = req.query.storeId;
    }

    const { categories, total } = await CategoryService.getAllCategoriesService(page, limit, storeId);
    return res.status(200).json({ categories, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    let storeId = null;
    if (req.user && req.user.storeId) {
      storeId = req.user.storeId;
    } else if (req.store) {
      storeId = req.store._id;
    }

    const category = await CategoryService.getCategoryByIdService(req.params.id, storeId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const storeId = req.user?.role === 'super_admin' ? null : req.user?.storeId;
    const updatedCategory = await CategoryService.updateCategoryService(req.params.id, req.body, storeId);
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada en tu tienda.' });
    }
    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const storeId = req.user?.role === 'super_admin' ? null : req.user?.storeId;
    const result = await CategoryService.deleteCategoryService(req.params.id, storeId);
    if (!result) {
      return res.status(404).json({ message: 'Categoría no encontrada en tu tienda.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error interno al eliminar categoría', error: error.message });
  }
};
