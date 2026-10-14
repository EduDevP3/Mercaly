// src/api/v1/controllers/auth.Controller.js
import {
  loginService,
  registerService,
  updatePasswordService,
  getProfileService,
  updateProfileService,
  getDashboardStatsService
} from '../services/auth.Service';
import { loginSchema, registerSchema } from '../validations/auth.validation';

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const userId = req.userTk.id;
    const result = await getProfileService(userId);

    if (result.error) {
      return res.status(result.status || 404).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error en getProfile controller:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Actualizar perfil (avatar, nombre, email, telefono, bio)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userTk.id;
    const result = await updateProfileService(userId, req.body);

    if (result.error) {
      return res.status(result.status || 400).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error en updateProfile controller:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Estadísticas para el dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const result = await getDashboardStatsService();
    return res.json(result);
  } catch (error) {
    console.error("❌ Error en getDashboardStats controller:", error.message);
    return res.status(500).json({ message: "Error obteniendo estadísticas", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userTk.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Se requieren la contraseña antigua y la nueva" });
    }

    const result = await updatePasswordService(userId, oldPassword, newPassword);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error("❌ Error en el controlador de changePassword:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Lógica para el login de usuario
export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, contraseña } = req.body;
    const result = await loginService(nombre, contraseña);

    if (result.error) {
      return res.status(result.status || 401).json({ message: result.error });
    }

    res.cookie("authToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600000,
    });

    return res.json({ message: "Inicio de sesión exitoso", token: result.token, user: result.user });
  } catch (error) {
    console.error("❌ Error en el controlador de login:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Lógica para el registro de usuario
export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, contraseña } = req.body;
    const result = await registerService(nombre, contraseña);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json({ message: result.message, token: result.token, user: result.user });
  } catch (error) {
    console.error('Error en el controlador de registro:', error.message);
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};
