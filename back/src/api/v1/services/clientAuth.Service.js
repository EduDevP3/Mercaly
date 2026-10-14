// src/api/v1/services/clientAuth.Service.js
import jwt from 'jsonwebtoken';
import { Client } from '../models/clientModel'; // Modelo de cliente
import config from '../../../config/config'; // Configuración para JWT

// Función para generar un token JWT
const generateToken = (clientData) => {
  const payload = {
    id: clientData._id,
    email: clientData.email,
    role: 'client', // Asignamos un rol de cliente
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '3h' }); // Token válido por 3 horas
};

export const loginClientService = async (email, password) => {
  try {
    const client = await Client.findOne({ email }).select("+password");

    if (!client) {
      console.log("❌ Cliente no encontrado");
      return { error: "Cliente no encontrado", status: 401 };
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Contraseña incorrecta");
      return { error: "Contraseña incorrecta", status: 401 };
    }

    const token = generateToken(client);
    const clientData = {
      id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      role: 'client'
    }
    return { token, client: clientData, status: 200 };
  } catch (error) {
    console.error("❌ Error en loginClientService:", error.message);
    throw new Error("Error interno del servidor");
  }
};


export const registerClientService = async (clientData) => {
  try {
    console.log('Service: Checking if client exists with email:', clientData.email);
    // Verificar si el cliente ya existe
    const existingClient = await Client.findOne({ email: clientData.email });
    if (existingClient) {
      console.log('Service: Client already exists.');
      return { error: "Este correo electrónico ya está registrado." };
    }

    console.log('Service: Client does not exist. Creating new client.');
    // Si el cliente no existe, proceder con el registro normal
    const newClient = new Client(clientData);
    await newClient.save();
    console.log('Service: New client saved successfully.');

    const token = generateToken(newClient);

    const clientResponse = {
      _id: newClient._id,
      firstName: newClient.firstName,
      lastName: newClient.lastName,
      email: newClient.email,
      phone: newClient.phone,
    };

    return {
      message: "Cliente registrado exitosamente.",
      token,
      client: clientResponse
    };
  } catch (error) {
    console.error("❌ Error en registerClientService:", error.message);
    throw new Error("Error interno del servidor");
  }
};
