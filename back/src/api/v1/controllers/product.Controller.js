import Store from '../models/storeModel.js';
import Product from '../models/productModel.js';
import { 
    getProductsService, 
    getProductByIdService, 
    getAllProductsSimpleService,
    createProductService,
    updateProductService,
    deleteProductService
} from '../services/product.Service.js';

export const createProduct = async (req, res) => {
    try {
        const storeId = req.user && req.user.storeId;
        if (!storeId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: { code: 'TENANT_REQUIRED', message: 'No tienes una tienda asignada para crear productos.' }
            });
        }

        // 1. Validar límite de productos del plan de suscripción
        const store = await Store.findById(storeId);
        const currentCount = await Product.countDocuments({ storeId });

        if (store && currentCount >= store.maxProducts) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: 'PLAN_LIMIT_REACHED',
                    message: `Has alcanzado el límite de ${store.maxProducts} productos de tu plan. Actualiza tu suscripción para continuar.`
                }
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'IMAGE_REQUIRED', message: 'La imagen del producto es obligatoria.' }
            });
        }

        const productData = {
            ...req.body,
            storeId,
            price: req.body.price !== undefined ? parseFloat(req.body.price) : 0,
            basePrice: req.body.basePrice !== undefined ? parseFloat(req.body.basePrice) : (req.body.price !== undefined ? parseFloat(req.body.price) : 0),
            stock: req.body.stock === 'false' ? false : Boolean(req.body.stock ?? true),
            isPublished: req.body.isPublished === 'false' ? false : Boolean(req.body.isPublished ?? true),
        };

        const newProduct = await createProductService(productData, req.file.buffer, storeId);
        return res.status(201).json({ success: true, data: newProduct, error: null });
    } catch (error) {
        console.error("❌ Error en createProduct controller:", error.message);
        const isClientError = error.message.includes('obligatorio') || error.message.includes('Ya existe');
        return res.status(isClientError ? 400 : 500).json({
            success: false,
            data: null,
            error: { code: isClientError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message: error.message }
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.user ? req.user.storeId : null;
        const isSuperAdmin = req.user && req.user.role === 'super_admin';
        const imageBuffer = req.file ? req.file.buffer : null;
        
        const productData = {
            ...req.body,
        };

        if (req.body.price !== undefined) {
            productData.price = parseFloat(req.body.price);
        }
        if (req.body.basePrice !== undefined) {
            productData.basePrice = parseFloat(req.body.basePrice);
        }
        if (req.body.stock !== undefined) {
            productData.stock = req.body.stock === 'true' || req.body.stock === true;
        }
        if (req.body.isPublished !== undefined) {
            productData.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
        }
        if (req.body.category !== undefined && req.body.category !== '') {
            productData.category = req.body.category;
        }

        const updatedProduct = await updateProductService(id, productData, imageBuffer, isSuperAdmin ? null : storeId);
        
        if (updatedProduct.error) {
            return res.status(updatedProduct.status).json({
                success: false,
                data: null,
                error: { code: 'UPDATE_FAILED', message: updatedProduct.error }
            });
        }

        return res.json({ success: true, data: updatedProduct, error: null });
    } catch (error) {
        console.error("❌ Error en updateProduct controller:", error.message);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.user ? req.user.storeId : null;
        const isSuperAdmin = req.user && req.user.role === 'super_admin';

        const result = await deleteProductService(id, isSuperAdmin ? null : storeId);

        if (result.error) {
            return res.status(result.status).json({
                success: false,
                data: null,
                error: { code: 'DELETE_FAILED', message: result.error }
            });
        }

        return res.json({ success: true, data: result, error: null });
    } catch (error) {
        console.error("❌ Error en deleteProduct controller:", error.message);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy, sortOrder, search, category } = req.query;
    
    // Si viene de resolveTenant, filtrar por storeId del tenant público; si está logueado como store_admin, usar su storeId
    let storeId = null;
    if (req.user && req.user.storeId) {
        storeId = req.user.storeId;
    } else if (req.store) {
        storeId = req.store._id;
    }

    const result = await getProductsService({ page, limit, sortBy, sortOrder, search, category, storeId });

    if (result.error) {
      return res.status(result.status || 500).json({
          success: false,
          data: null,
          error: { code: 'QUERY_FAILED', message: result.error }
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error en getProducts controller:", error.message);
    return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

export const getAllProductsSimple = async (req, res) => {
  try {
    let storeId = null;
    if (req.user && req.user.storeId) {
        storeId = req.user.storeId;
    } else if (req.store) {
        storeId = req.store._id;
    }

    const products = await getAllProductsSimpleService(storeId);
    return res.json(products);
  } catch (error) {
    console.error("❌ Error en getAllProductsSimple controller:", error.message);
    return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let storeId = null;
    if (req.user && req.user.storeId) {
        storeId = req.user.storeId;
    } else if (req.store) {
        storeId = req.store._id;
    }

    const result = await getProductByIdService(id, storeId);

    if (result.error) {
      return res.status(result.status || 404).json({
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: result.error }
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error en getProductById controller:", error.message);
    return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};
