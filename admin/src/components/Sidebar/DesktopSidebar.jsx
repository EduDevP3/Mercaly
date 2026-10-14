import React from 'react'
import { SidebarContent } from './index'

function DesktopSidebar() {
  return (
    <aside className="z-30 flex-shrink-0 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:block border-r border-gray-100 dark:border-gray-700/50">
      <SidebarContent />
    </aside>
  )
}

export default DesktopSidebar
