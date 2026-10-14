import Store from '../models/storeModel.js';
import Product from '../models/productModel.js';

/**
 * Retorna la ficha de vigencia del tenant del usuario actual (Store Admin)
 * GET /api/v1/admin/subscription/status
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const storeId = req.user && req.user.storeId;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'STORE_NOT_ASSOCIATED', message: 'El usuario no tiene una tienda vinculada.' },
      });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'STORE_NOT_FOUND', message: 'Tienda asociada no encontrada.' },
      });
    }

    const productsCount = await Product.countDocuments({ storeId });
    const now = Date.now();
    const expiresAtMs = new Date(store.subscriptionExpiresAt).getTime();
    const msRemaining = expiresAtMs - now;
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isExpiringSoon = daysRemaining <= 5 && daysRemaining > 0;
    const maxProducts = store.maxProducts || 50;
    const usagePercentage = Math.min(100, parseFloat(((productsCount / maxProducts) * 100).toFixed(1)));

    return res.status(200).json({
      success: true,
      data: {
        storeName: store.name,
        slug: store.slug,
        plan: store.subscriptionPlan,
        status: store.subscriptionStatus,
        isActive: store.isActive,
        expiresAt: store.subscriptionExpiresAt,
        daysRemaining,
        isExpiringSoon,
        usage: {
          productsCount,
          maxProducts,
          usagePercentage,
        },
        billingSupportWhatsapp: process.env.SUPER_ADMIN_WHATSAPP || '523221045519',
      },
      error: null,
    });
  } catch (error) {
    console.error('❌ Error en getSubscriptionStatus:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno consultando suscripción' },
    });
  }
};
