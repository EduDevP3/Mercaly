import axios from "axios";

// Resolución inteligente de la URL de la API:
// Si corre en localhost, usa el backend local donde residen las rutas nuevas;
// de lo contrario, usa la URL configurada en variables de entorno o Render.
const getBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return (
      import.meta.env.VITE_LOCAL_API_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:82/api/v1"
    );
  }
  return import.meta.env.VITE_API_URL || "https://tribuna-back-nfl9.onrender.com/api/v1";
};

// Instancia de Axios con soporte de cookies y credenciales
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

// Interceptor para inyectar token de localStorage si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Obtener estado de suscripción de la tienda actual (Store Admin)
 */
export const getSubscriptionStatus = async () => {
  const response = await apiClient.get("/admin/subscription/status");
  return response.data.data;
};

/**
 * Obtener métricas consolidadas de la plataforma (Super Admin)
 */
export const getSuperAdminMetrics = async () => {
  const response = await apiClient.get("/super-admin/metrics");
  return response.data.data;
};

/**
 * Listar todas las tiendas (Super Admin)
 */
export const getSuperAdminStores = async () => {
  const response = await apiClient.get("/super-admin/stores");
  return response.data.data;
};

/**
 * Crear tienda y usuario administrador (Super Admin)
 */
export const createStoreWithAdmin = async (storePayload) => {
  const response = await apiClient.post("/super-admin/stores", storePayload);
  return response.data.data;
};

/**
 * Modificar plan y vigencia de una tienda (Super Admin)
 */
export const updateStoreSubscription = async (storeId, updatePayload) => {
  const response = await apiClient.patch(`/super-admin/stores/${storeId}/subscription`, updatePayload);
  return response.data.data;
};

/**
 * Modificar datos generales de una tienda: nombre, slug, whatsappNumber (Super Admin)
 */
export const updateStoreData = async (storeId, updatePayload) => {
  const response = await apiClient.patch(`/super-admin/stores/${storeId}`, updatePayload);
  return response.data.data;
};

/**
 * Alternar Kill-Switch de una tienda (Super Admin)
 */
export const toggleStoreKillSwitch = async (storeId, isActive) => {
  const response = await apiClient.patch(`/super-admin/stores/${storeId}/kill-switch`, { isActive });
  return response.data.data;
};

/**
 * Obtener inventario de Bases de Datos y Colecciones en MongoDB Atlas (Super Admin)
 */
export const getAtlasDatabases = async () => {
  const response = await apiClient.get("/super-admin/databases");
  return response.data.data;
};

/**
 * Aprovisionar una nueva base de datos para un tenant en MongoDB Atlas
 */
export const provisionAtlasDatabase = async (payload) => {
  const response = await apiClient.post("/super-admin/databases/provision", payload);
  return response.data.data;
};

/**
 * Impersonar / acceder al panel de una tienda específica (Super Admin)
 */
export const impersonateStore = async (storeId) => {
  const response = await apiClient.post(`/super-admin/stores/${storeId}/impersonate`);
  return response.data.data;
};

export default {
  getSubscriptionStatus,
  getSuperAdminMetrics,
  getSuperAdminStores,
  createStoreWithAdmin,
  updateStoreSubscription,
  updateStoreData,
  toggleStoreKillSwitch,
  getAtlasDatabases,
  provisionAtlasDatabase,
  impersonateStore,
};
