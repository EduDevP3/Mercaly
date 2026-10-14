import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import { uploadImageStream, deleteImage } from '../../../config/cloudinary.config.js';
import { escapeRegex, isValidMongoId } from '../utils/security.utils.js';

/**
 * Resuelve una categoría de forma inteligente: acepta un ObjectId, el nombre o el slug handle.
 */
const resolveCategory = async (categoryInput) => {
  if (!categoryInput) return null;

  const rawInput = String(categoryInput).trim();

  // 1. Si es un ObjectId válido de Mongo
  if (isValidMongoId(rawInput)) {
    const docById = await Category.findById(rawInput);
    if (docById) return docById;
  }

  // 2. Búsqueda por nombre (insensible a mayúsculas) o handle
  const safeText = escapeRegex(rawInput);
  const docByNameOrHandle = await Category.findOne({
    $or: [
      { name: { $regex: `^${safeText}$`, $options: 'i' } },
      { handle: rawInput.toLowerCase() }
    ]
  });

  return docByNameOrHandle;
};

/**
 * Genera un slug handle URL-friendly a partir de un texto.
 */
const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const createProductService = async (productData, imageBuffer, storeId) => {
  try {
    if (!productData.sku || !productData.title) {
      throw new Error("El SKU y el Título del producto son obligatorios.");
    }

    if (!imageBuffer) {
      throw new Error("Se requiere una imagen para crear el producto.");
    }

    // Normalizar SKU
    const cleanSku = productData.sku.trim().toUpperCase();
    productData.sku = cleanSku;

    // Verificar si el SKU ya existe DENTRO DE ESTE TENANT
    const existingSku = await Product.findOne({ storeId, sku: cleanSku });
    if (existingSku) {
      throw new Error(`Ya existe un producto con el SKU '${cleanSku}' en tu catálogo.`);
    }

    // Resolver categoría de forma profesional
    let categoryName = "General";
    let categoryRef = null;

    if (productData.category) {
      const categoryDoc = await resolveCategory(productData.category);
      if (categoryDoc) {
        categoryName = categoryDoc.name;
        categoryRef = categoryDoc._id;
      } else {
        categoryName = String(productData.category).trim();
      }
    }

    productData.category = categoryName;
    if (categoryRef) productData.categoryRef = categoryRef;

    // Generar handle / slug único dentro del tenant
    let baseHandle = productData.handle ? slugify(productData.handle) : slugify(productData.title);
    const existingHandle = await Product.findOne({ storeId, slug: baseHandle });
    if (existingHandle) {
      baseHandle = `${baseHandle}-${cleanSku.toLowerCase()}`;
    }
    productData.handle = baseHandle;
    productData.slug = baseHandle;
    productData.name = productData.title;

    // Subir imagen organizada en Cloudinary (catalog/products/SKU)
    const uploadResult = await uploadImageStream(imageBuffer, cleanSku);
    productData.image_url = uploadResult.secure_url;
    productData.image_public_id = uploadResult.public_id;
    productData.images = [uploadResult.secure_url];

    const newProduct = new Product({
      ...productData,
      storeId,
    });
    await newProduct.save();

    return newProduct;
  } catch (error) {
    console.error("❌ Error en createProductService:", error.message);
    throw error;
  }
};

export const updateProductService = async (id, productData, imageBuffer, storeId = null) => {
  try {
    if (!isValidMongoId(id)) {
      return { error: 'Formato de ID de producto inválido', status: 400 };
    }

    const query = { _id: id };
    if (storeId) {
      query.storeId = storeId;
    }

    const product = await Product.findOne(query);
    if (!product) {
      return { error: 'Producto no encontrado en este catálogo', status: 404 };
    }

    const effectiveStoreId = product.storeId;
    const skuToUse = productData.sku ? productData.sku.trim().toUpperCase() : product.sku;

    if (productData.sku && skuToUse !== product.sku) {
      productData.sku = skuToUse;
      const duplicateSku = await Product.findOne({ storeId: effectiveStoreId, sku: skuToUse });
      if (duplicateSku) {
        return { error: `El SKU ${skuToUse} ya está en uso por otro producto de tu tienda`, status: 400 };
      }
    }

    // Si se subió una nueva imagen
    if (imageBuffer) {
      const oldImageRef = product.image_public_id || product.image_url;
      if (oldImageRef) {
        await deleteImage(oldImageRef);
      }

      const uploadResult = await uploadImageStream(imageBuffer, skuToUse);
      productData.image_url = uploadResult.secure_url;
      productData.image_public_id = uploadResult.public_id;
      productData.images = [uploadResult.secure_url];
    }

    // Resolver categoría si cambió
    if (productData.category && productData.category !== product.category) {
      const categoryDoc = await resolveCategory(productData.category);
      if (categoryDoc) {
        productData.category = categoryDoc.name;
        productData.categoryRef = categoryDoc._id;
      } else {
        productData.category = String(productData.category).trim();
      }
    }

    if (productData.title && !productData.name) productData.name = productData.title;
    if (productData.handle && !productData.slug) productData.slug = productData.handle;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true, runValidators: true }
    );

    return updatedProduct;
  } catch (error) {
    console.error("❌ Error en updateProductService:", error.message);
    return { error: error.message || 'Error al actualizar producto', status: 500 };
  }
};

export const deleteProductService = async (id, storeId = null) => {
  try {
    if (!isValidMongoId(id)) {
      return { error: 'Formato de ID de producto inválido', status: 400 };
    }

    const query = { _id: id };
    if (storeId) {
      query.storeId = storeId;
    }

    const product = await Product.findOne(query);
    if (!product) {
      return { error: 'Producto no encontrado en este catálogo', status: 404 };
    }

    // Limpiar imagen en Cloudinary
    const imageRef = product.image_public_id || product.image_url;
    if (imageRef) {
      try {
        await deleteImage(imageRef);
      } catch (cloudErr) {
        console.warn("⚠️ No se pudo eliminar la imagen en Cloudinary:", cloudErr.message);
      }
    }

    await Product.findByIdAndDelete(id);

    return { message: "Producto eliminado correctamente", id };
  } catch (error) {
    console.error("❌ Error en deleteProductService:", error.message);
    return { error: error.message || 'Error al eliminar producto', status: 500 };
  }
};

export const getProductsService = async ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, category, storeId = null }) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (storeId) {
      filter.storeId = storeId;
    }

    // Filtrar por categoría
    if (category && category !== 'All' && category !== 'Todas') {
      const safeCat = escapeRegex(category);
      filter.category = { $regex: `^${safeCat}$`, $options: 'i' };
    }

    // Búsqueda por texto (SKU o Título)
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { name: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    const validSortFields = ['createdAt', 'price', 'title', 'sku', 'stock', 'basePrice'];
    const fieldToSort = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[fieldToSort] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  } catch (error) {
    console.error("❌ Error en getProductsService:", error.message);
    return { error: error.message || 'Error al obtener productos', status: 500 };
  }
};

export const getAllProductsSimpleService = async (storeId = null) => {
  try {
    const filter = { stock: true };
    if (storeId) {
      filter.storeId = storeId;
    }
    return await Product.find(filter).select('title name sku price basePrice image_url images category stock handle slug variants').lean();
  } catch (error) {
    console.error("❌ Error en getAllProductsSimpleService:", error.message);
    throw error;
  }
};

export const getProductByIdService = async (id, storeId = null) => {
  try {
    if (!isValidMongoId(id)) {
      // Intentar buscar por handle/slug
      const filter = {
        $or: [{ handle: id }, { slug: id }]
      };
      if (storeId) filter.storeId = storeId;

      const productBySlug = await Product.findOne(filter);
      if (productBySlug) return productBySlug;

      return { error: 'Producto no encontrado', status: 404 };
    }

    const query = { _id: id };
    if (storeId) query.storeId = storeId;

    const product = await Product.findOne(query);
    if (!product) {
      return { error: 'Producto no encontrado en este catálogo', status: 404 };
    }

    return product;
  } catch (error) {
    console.error("❌ Error en getProductByIdService:", error.message);
    return { error: error.message || 'Error al consultar producto', status: 500 };
  }
};
