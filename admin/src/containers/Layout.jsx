import React, { useContext, Suspense, useEffect, lazy } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import routes from '../routes'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import ThemedSuspense from '../components/ThemedSuspense'
import { SidebarContext } from '../context/SidebarContext'
import { ProductProvider } from '../context/ProductContext'

const Page404 = lazy(() => import('../pages/404'))

import { AuthContext } from '../context/AuthContext'

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  const { user } = useContext(AuthContext)
  let location = useLocation()

  const isSuperAdmin = user && (user.role === 'super_admin' || user.role === 'superadmin');

  useEffect(() => {
    closeSidebar()
  }, [location, closeSidebar])

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <ProductProvider>
          <Main>
            <Suspense fallback={<ThemedSuspense />}>
              <Switch>
                {/* Redirección estricta de Super Admin intentando entrar a Dashboard de tienda */}
                {isSuperAdmin && (
                  <Route exact path="/app/dashboard">
                    <Redirect to="/app/super-admin" />
                  </Route>
                )}

                {/* Bloqueo a Store Admin intentando entrar a Consola de Super Admin */}
                {!isSuperAdmin && (
                  <Route path="/app/super-admin">
                    <Redirect to="/app/dashboard" />
                  </Route>
                )}

                {routes.map((route, i) => {
                  return route.component ? (
                    <Route
                      key={i}
                      exact={route.path === "/all-products" ? false : true}
                      path={`/app${route.path}`}
                      render={(props) => <route.component {...props} />}
                    />
                  ) : null
                })}

                <Redirect exact from="/app" to={isSuperAdmin ? "/app/super-admin" : "/app/dashboard"} />
                <Route component={Page404} />
              </Switch>
            </Suspense>
          </Main>
        </ProductProvider>
      </div>
    </div>
  )
}

export default Layout
