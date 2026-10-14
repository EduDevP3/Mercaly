// src/api/v1/services/authService.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import Product from '../models/productModel';
import { Order } from '../models/orderModel';
import { Client } from '../models/clientModel';
import config from '../../../config/config';
import { isValidMongoId } from '../utils/security.utils';

// Función para generar un token JWT
const generateToken = (userData) => {
  const effectiveStoreId = userData.storeId?._id || userData.storeId || null;
  const payload = {
    id: userData._id,
    userId: userData._id,
    nombre: userData.nombre,
    role: userData.role || 'admin',
    avatar: userData.avatar,
    storeId: effectiveStoreId,
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

export const loginService = async (nombre, contraseña) => {
  try {
    const user = await User.findOne({
      $or: [
        { nombre },
        { email: nombre.toLowerCase().trim() },
      ],
    }).select("+contraseña").populate('storeId', 'name slug logoUrl plan');

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return { error: "Usuario no encontrado", status: 401 };
    }

    const isMatch = await user.comparePassword(contraseña);
    if (!isMatch) {
      console.log("❌ Contraseña incorrecta");
      return { error: "Contraseña incorrecta", status: 401 };
    }

    const token = generateToken(user);
    const userData = {
      id: user._id,
      nombre: user.nombre,
      email: user.email || '',
      avatar: user.avatar || '',
      role: user.role || 'admin',
      storeId: user.storeId,
      storeSlug: user.storeId?.slug || '',
      phone: user.phone || '',
      bio: user.bio || '',
      createdAt: user.createdAt,
    };
    return { token, user: userData, status: 200 };
  } catch (error) {
    console.error("❌ Error en loginService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const registerService = async (nombre, contraseña) => {
  try {
    const existingUser = await User.findOne({ nombre });
    if (existingUser) {
      return { error: "Este nombre de usuario ya está registrado." };
    }

    const newUser = new User({
      nombre,
      contraseña,
    });
    await newUser.save();

    const token = generateToken(newUser);

    return {
      message: "Usuario registrado exitosamente.",
      token,
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        storeId: newUser.storeId,
      }
    };
  } catch (error) {
    console.error("❌ Error en registerService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const getProfileService = async (userId) => {
  try {
    if (!isValidMongoId(userId)) {
      return { error: "ID de usuario inválido", status: 400 };
    }

    const user = await User.findById(userId).populate('storeId', 'name slug logoUrl plan').lean();
    if (!user) {
      return { error: "Usuario no encontrado", status: 404 };
    }

    return {
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'admin',
        storeId: user.storeId,
        storeSlug: user.storeId?.slug || '',
        phone: user.phone || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      status: 200
    };
  } catch (error) {
    console.error("❌ Error en getProfileService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const updateProfileService = async (userId, profileData) => {
  try {
    if (!isValidMongoId(userId)) {
      return { error: "ID de usuario inválido", status: 400 };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { error: "Usuario no encontrado", status: 404 };
    }

    // Campos editables
    if (profileData.nombre && profileData.nombre.trim()) {
      user.nombre = profileData.nombre.trim();
    }
    if (profileData.email !== undefined) {
      user.email = profileData.email.trim();
    }
    if (profileData.avatar !== undefined) {
      user.avatar = profileData.avatar;
    }
    if (profileData.phone !== undefined) {
      user.phone = profileData.phone.trim();
    }
    if (profileData.bio !== undefined) {
      user.bio = profileData.bio.trim();
    }

    await user.save();

    return {
      message: "Perfil actualizado exitosamente",
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        updatedAt: user.updatedAt,
      },
      status: 200
    };
  } catch (error) {
    console.error("❌ Error en updateProfileService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const updatePasswordService = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+contraseña");
    if (!user) {
      return { error: "Usuario no encontrado", status: 404 };
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return { error: "La contraseña antigua es incorrecta", status: 400 };
    }

    user.contraseña = newPassword;
    await user.save();

    return { message: "Contraseña actualizada exitosamente", status: 200 };
  } catch (error) {
    console.error("❌ Error en updatePasswordService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const getDashboardStatsService = async () => {
  try {
    const [totalProducts, totalOrders, pendingOrders, totalClients, paidOrders] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } }),
      Client.countDocuments({}),
      Order.find({ isPaid: true }).select('totalPrice').lean(),
    ]);

    const totalRevenue = paidOrders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);

    return {
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalClients,
        totalRevenue,
      },
      status: 200
    };
  } catch (error) {
    console.error("❌ Error en getDashboardStatsService:", error.message);
    throw new Error("Error obteniendo estadísticas del dashboard");
  }
};
