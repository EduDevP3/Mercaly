/**
 * Rutas dinámicas para la Barra Lateral según el Rol (Super Admin vs Store Admin)
 */

export const storeAdminRoutes = [
  {
    path: "/app/dashboard",
    icon: "HomeIcon",
    name: "Tablero",
  },
  {
    icon: "TruckIcon",
    name: "Productos",
    routes: [
      {
        path: "/app/all-products",
        name: "Todos los Productos",
      },
      {
        path: "/app/add-product",
        name: "Agregar Producto",
      },
    ],
  },
  {
    path: "/app/categories",
    icon: "FormsIcon",
    name: "Categorías",
  },
  {
    path: "/app/settings",
    icon: "OutlineCogIcon",
    name: "Configuración",
  },
  {
    path: "/app/subscription",
    icon: "CardsIcon",
    name: "Mi Suscripción",
  },
];

export const superAdminRoutes = [
  {
    path: "/app/super-admin",
    icon: "ModalsIcon",
    name: "Super Admin",
  },
];

export const getSidebarRoutes = (role) => {
  if (role === "super_admin" || role === "superadmin") {
    return superAdminRoutes;
  }
  return storeAdminRoutes;
};

export default storeAdminRoutes;
