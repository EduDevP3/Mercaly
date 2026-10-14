import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { isValidMongoId } from '../utils/security.utils.js';

const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const createCategoryService = async (categoryData, storeId) => {
  try {
    const name = categoryData.name ? categoryData.name.trim() : '';
    if (!name) {
      throw new Error('El nombre de la categoría es obligatorio.');
    }

    if (!storeId) {
      throw new Error('Se requiere una tienda (storeId) para asociar la categoría.');
    }

    const handle = categoryData.handle ? slugify(categoryData.handle) : slugify(name);

    // Verificar si ya existe por nombre o handle DENTRO DE ESTE TENANT
    const existing = await Category.findOne({
      storeId,
      $or: [{ name: { $regex: `^${name}$`, $options: 'i' } }, { handle }]
    });

    if (existing) {
      throw new Error(`Ya existe una categoría con el nombre '${name}' en tu tienda.`);
    }

    const newCategory = new Category({
      storeId,
      name,
      description: categoryData.description ? categoryData.description.trim() : '',
      handle,
    });

    await newCategory.save();
    return newCategory;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Ya existe una categoría con este identificador en tu tienda.');
    }
    throw error;
  }
};

export const getAllCategoriesService = async (page = 1, limit, storeId = null) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const filter = {};
    if (storeId) {
      filter.storeId = storeId;
    }

    let categoriesQuery = Category.find(filter).sort({ name: 1 });

    if (limit && limit > 0) {
      const skip = (pageNum - 1) * limit;
      categoriesQuery = categoriesQuery.skip(skip).limit(limit);
    }

    const [categories, total] = await Promise.all([
      categoriesQuery.lean(),
      Category.countDocuments(filter)
    ]);

    return { categories, total };
  } catch (error) {
    throw new Error(`Error al obtener categorías: ${error.message}`);
  }
};

export const getCategoryByIdService = async (id, storeId = null) => {
  try {
    const filter = {};
    if (storeId) filter.storeId = storeId;

    if (isValidMongoId(id)) {
      filter._id = id;
    } else {
      filter.handle = String(id).toLowerCase().trim();
    }

    return await Category.findOne(filter);
  } catch (error) {
    throw new Error(`Error al buscar categoría: ${error.message}`);
  }
};

export const updateCategoryService = async (id, categoryData, storeId = null) => {
  try {
    if (!isValidMongoId(id)) {
      throw new Error('Formato de ID de categoría inválido.');
    }

    const query = { _id: id };
    if (storeId) query.storeId = storeId;

    const category = await Category.findOne(query);
    if (!category) {
      return null;
    }

    const oldName = category.name;
    const newName = categoryData.name ? categoryData.name.trim() : category.name;

    if (categoryData.name && newName.toLowerCase() !== oldName.toLowerCase()) {
      const duplicate = await Category.findOne({
        storeId: category.storeId,
        _id: { $ne: id },
        name: { $regex: `^${newName}$`, $options: 'i' }
      });
      if (duplicate) {
        throw new Error(`Ya existe otra categoría con el nombre '${newName}' en tu tienda.`);
      }
    }

    category.name = newName;
    if (categoryData.description !== undefined) {
      category.description = categoryData.description.trim();
    }
    if (categoryData.handle) {
      category.handle = slugify(categoryData.handle);
    } else if (categoryData.name) {
      category.handle = slugify(newName);
    }

    await category.save();

    // Actualización en cascada para productos vinculados de esa tienda
    if (oldName !== newName) {
      await Product.updateMany(
        { storeId: category.storeId, category: oldName },
        { $set: { category: newName } }
      );
    }

    return category;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('El identificador o nombre de la categoría ya está en uso en tu tienda.');
    }
    throw error;
  }
};

export const deleteCategoryService = async (id, storeId = null) => {
  try {
    if (!isValidMongoId(id)) {
      throw new Error('Formato de ID de categoría inválido.');
    }

    const query = { _id: id };
    if (storeId) query.storeId = storeId;

    const category = await Category.findOne(query);
    if (!category) {
      return null;
    }

    const categoryName = category.name;
    const effectiveStoreId = category.storeId;

    await Category.deleteOne({ _id: id });

    // Reasignación automática de productos vinculados en esta tienda
    await Product.updateMany(
      { storeId: effectiveStoreId, category: categoryName },
      { $set: { category: 'General', categoryRef: null } }
    );

    return { message: 'Categoría eliminada con éxito y productos reasignados a General.' };
  } catch (error) {
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
};
