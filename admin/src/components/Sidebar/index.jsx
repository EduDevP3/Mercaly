import React, { useContext } from 'react'
import { NavLink, Route, Link } from 'react-router-dom'
import { Transition, Backdrop } from '@windmill/react-ui'
import { SidebarContext } from '../../context/SidebarContext'
import { AuthContext } from '../../context/AuthContext'
import { getSidebarRoutes } from '../../routes/sidebar'
import * as Icons from '../../icons'
import SidebarSubmenu from './SidebarSubmenu'

function Icon({ icon, ...props }) {
  const IconComponent = Icons[icon] || Icons.HomeIcon
  return <IconComponent {...props} />
}

export function SidebarContent() {
  const { user } = useContext(AuthContext)
  const isSuperAdmin = user && (user.role === 'super_admin' || user.role === 'superadmin')
  const visibleRoutes = getSidebarRoutes(user?.role)

  const appName =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_NAME) ||
    'Mercaly'

  const storeDisplayName =
    user?.storeId?.name ||
    user?.nombre ||
    'Mi Tienda'

  return (
    <div className="py-4 text-gray-500 dark:text-gray-400">
      <div className="px-6 mb-4">
        <Link
          className="text-lg font-bold text-gray-800 dark:text-gray-200 inline-flex items-center tracking-wide"
          to={isSuperAdmin ? '/app/super-admin' : '/app/dashboard'}
        >
          <span className="text-teal-600 dark:text-teal-400 font-extrabold text-xl mr-2">
            {appName}
          </span>
          <span className="text-gray-700 dark:text-gray-200 font-semibold truncate">
            {isSuperAdmin ? 'Super Admin' : storeDisplayName}
          </span>
        </Link>
      </div>

      <ul className="mt-6">
        {visibleRoutes.map((route) =>
          route.routes ? (
            <SidebarSubmenu route={route} key={route.name} />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100 font-bold"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
    </div>
  )
}

function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)

  return (
    <>
      {/* 1. Desktop Sidebar (visible solo en pantallas grandes) */}
      <aside className="z-30 flex-shrink-0 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:block border-r border-gray-100 dark:border-gray-700/50">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Sidebar con transición deslizable y Backdrop */}
      <Transition show={isSidebarOpen}>
        <>
          <Transition
            enter="transition ease-in-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Backdrop onClick={closeSidebar} />
          </Transition>

          <Transition
            enter="transition ease-in-out duration-150"
            enterFrom="opacity-0 transform -translate-x-20"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 transform -translate-x-20"
          >
            <aside className="fixed inset-y-0 z-50 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 lg:hidden shadow-xl">
              <SidebarContent />
            </aside>
          </Transition>
        </>
      </Transition>
    </>
  )
}

export default Sidebar
