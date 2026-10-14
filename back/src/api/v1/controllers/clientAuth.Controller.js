// src/api/v1/controllers/clientAuth.Controller.js
import { loginClientService, registerClientService } from '../services/clientAuth.Service';
import { loginClientSchema, registerClientSchema } from '../validations/clientAuth.validation';

// Lógica para el login de cliente
export const loginClient = async (req, res) => {
  try {
    // 1. Validar entrada
    const { error } = loginClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const result = await loginClientService(email, password);

    // Verifica si hubo un error en loginClientService
    if (result.error) {
      return res.status(result.status || 401).json({ message: result.error });
    }

    // Configuramos la cookie de autenticación con opciones de seguridad
    res.cookie("clientAuthToken", result.token, {
      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // Requiere HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Permite compartir cookies entre diferentes dominios en prod, 'Lax' para dev
      maxAge: 3600000, // Expira en 1 hora (3600000 ms)
    });

    return res.json({ message: "Inicio de sesión exitoso", token: result.token, client: result.client });
  } catch (error) {
    console.error("❌ Error en el controlador de login de cliente:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};


// Lógica para el registro de cliente
export const registerClient = async (req, res) => {
  console.log('Request body:', req.body);
  try {
    // 1. Validar entrada
    const { error } = registerClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Llamamos al servicio de registro
    const result = await registerClientService(req.body);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    // Seteamos la cookie para que el usuario quede logueado inmediatamente
    res.cookie("clientAuthToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600000,
    });

    return res.status(201).json({
      message: result.message,
      token: result.token,
      client: result.client
    });
  } catch (error) {
    console.error('Error en el controlador de registro de cliente:', error.message);
    return res.status(500).json({ message: 'Error al registrar el cliente', error: error.message });
  }
};
