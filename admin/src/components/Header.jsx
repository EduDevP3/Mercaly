import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { SidebarContext } from "../context/SidebarContext";
import {
  MoonIcon,
  SunIcon,
  MenuIcon,
  OutlinePersonIcon,
  OutlineCogIcon,
  OutlineLogoutIcon,
} from "../icons";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  WindmillContext,
} from "@windmill/react-ui";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getStorefrontUrl } from "../utils/storefrontUrl";
import StoreQrModal from "./StoreQrModal";

function Header() {
  const { mode, toggleMode } = useContext(WindmillContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const { logout, user } = useContext(AuthContext);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  function handleProfileClick() {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }

  const isSuperAdmin = user && (user.role === "super_admin" || user.role === "superadmin");
  const storeSlug = user?.storeSlug || user?.storeId?.slug || (user?.nombre === "acme_admin" ? "acme-store" : "demo-store");
  const storeName = user?.storeId?.name || (user?.nombre === "acme_admin" ? "ACME Store México" : "Mi Catálogo");
  const storefrontUrl = getStorefrontUrl(storeSlug);

  const defaultAvatar = `https://api.dicebear.com/7.x/personas/png?seed=${encodeURIComponent(user?.nombre || 'Admin')}`;
  const currentAvatar = (user && user.avatar) ? user.avatar : defaultAvatar;

  return (
    <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* <!-- Mobile hamburger --> */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Indicador de tienda y accesos directos al catálogo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!isSuperAdmin && (
            <>
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 transition"
                title="Abrir Catálogo en Vivo"
              >
                <span>Ver Catálogo</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(storefrontUrl);
                  toast.success("Enlace de tu catálogo copiado al portapapeles");
                }}
                className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                title="Copiar enlace del catálogo"
              >
                Copiar Enlace
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                title="Código QR del catálogo para imprimir"
              >
                Código QR
              </button>
            </>
          )}

          {user?.storeId?.name && (
            <span className="hidden lg:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {user.storeId.name}
            </span>
          )}
        </div>

        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === "dark" ? (
                <SunIcon className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600 hover:text-purple-600 transition-colors" aria-hidden="true" />
              )}
            </button>
          </li>
         
          {/* <!-- Profile menu --> */}
          <li className="relative">
            <button
              className="flex items-center space-x-2 rounded-full focus:shadow-outline-purple focus:outline-none"
              onClick={handleProfileClick}
              aria-label="Account"
              aria-haspopup="true"
            >
              <Avatar
                className="align-middle ring-2 ring-purple-600 dark:ring-purple-400"
                src={currentAvatar}
                alt={user?.nombre || "Admin"}
                aria-hidden="true"
              />
              <span className="hidden md:inline-block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {user?.nombre || 'Admin'}
              </span>
            </button>
            <Dropdown
              align="right"
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
              className="w-56"
            >
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400">Conectado como</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                  {user?.nombre || 'Administrador'}
                </p>
                <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  {user?.role || 'admin'}
                </span>
              </div>

              <DropdownItem tag={Link} to="/app/manage-profile">
                <OutlinePersonIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Mi Perfil</span>
              </DropdownItem>

              <DropdownItem tag={Link} to="/app/settings">
                <OutlineCogIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Configuración</span>
              </DropdownItem>

              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

              <DropdownItem onClick={logout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
                <OutlineLogoutIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </DropdownItem>
            </Dropdown>
          </li>
        </ul>
      </div>

      <StoreQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        storeName={storeName}
        storeUrl={storefrontUrl}
      />
    </header>
  );
}

export default Header;
